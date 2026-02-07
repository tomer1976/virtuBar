import { MutableRefObject, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { computeMoveVector, trackKeyPresses } from './input';
import { createFpsMeter } from './fpsMeter';
import { createNpcStates, createRng, stepNpcGroup } from './sim/npcSim';
import { createNpcChatState, stepNpcChat } from './sim/npcChat';
import { generateNearbyUsers, NearbyUser } from '../state/mockNearby';

type RendererFactoryOptions = {
  antialias: boolean;
  alpha: boolean;
};

type RendererLike = {
  domElement: HTMLCanvasElement;
  shadowMap: { enabled: boolean };
  setSize: (width: number, height: number, updateStyle?: boolean) => void;
  setPixelRatio: (ratio: number) => void;
  setAnimationLoop?: (callback: ((time: number) => void) | null) => void;
  render: (scene: THREE.Scene, camera: THREE.Camera) => void;
  dispose: () => void;
};

type SceneRootProps = {
  enableShadows?: boolean;
  rendererFactory?: (options: RendererFactoryOptions) => RendererLike;
  skipSupportCheck?: boolean;
  gltfUrl?: string;
  loaderFactory?: () => GltfLoader;
  loadScene?: boolean;
  quality?: 'low' | 'medium' | 'high';
  mobileMoveRef?: MutableRefObject<{ x: number; z: number } | null>;
  mobileLookDeltaRef?: MutableRefObject<{ dx: number; dy: number } | null>;
  profileSeed?: string | number;
  onSelectProfile?: (user: NearbyUser) => void;
  playerProfile?: NearbyUser;
  raycasterFactory?: () => THREE.Raycaster;
  enableNpcCrowdSim?: boolean;
};

const defaultRendererFactory = (options: RendererFactoryOptions): RendererLike =>
  new THREE.WebGLRenderer(options);

type GltfLoader = {
  load: (
    url: string,
    onLoad: (gltf: { scene: THREE.Group }) => void,
    onProgress?: (event: ProgressEvent<EventTarget>) => void,
    onError?: (error: unknown) => void,
  ) => void;
};

const defaultLoaderFactory = (): GltfLoader => new GLTFLoader();

const lightingPresets: Record<'low' | 'medium' | 'high', { ambient: number; hemi: number; key: number }> = {
  low: { ambient: 0.25, hemi: 0.25, key: 0.7 },
  medium: { ambient: 0.32, hemi: 0.35, key: 1 },
  high: { ambient: 0.35, hemi: 0.45, key: 1.1 },
};

const npcCountByQuality: Record<'low' | 'medium' | 'high', number> = {
  low: 12,
  medium: 18,
  high: 22,
};

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch (error) {
    console.warn('SceneRoot: WebGL support detection failed', error);
    return false;
  }
}

function measureSize(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const width = rect.width || element.clientWidth || 640;
  const height = rect.height || element.clientHeight || 360;
  return {
    width,
    height,
  };
}

function SceneRoot({
  enableShadows = true,
  rendererFactory = defaultRendererFactory,
  loaderFactory = defaultLoaderFactory,
  skipSupportCheck = false,
  gltfUrl = '/models/bar.glb',
  loadScene = true,
  quality = 'high',
  mobileMoveRef,
  mobileLookDeltaRef,
  profileSeed,
  onSelectProfile,
  playerProfile,
  raycasterFactory,
  enableNpcCrowdSim = true,
}: SceneRootProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const lights = useMemo(() => ({
    ambient: new THREE.AmbientLight(0xffffff, 0.35),
    hemi: new THREE.HemisphereLight(0x7dd3fc, 0x0f172a, 0.45),
    key: new THREE.DirectionalLight(0xffffff, 1.1),
  }), []);
  const playerRef = useRef<THREE.Group | null>(null);
  const walkPhaseRef = useRef(0);
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const yawRef = useRef(0);
  const pitchRef = useRef(0);
  const pointerLockedRef = useRef(false);

  useEffect(() => {
    const mountEl = mountRef.current;
    if (!mountEl) {
      return undefined;
    }

    mountEl.style.position = mountEl.style.position || 'relative';

    setInitError(null);
    setModelError(null);
    yawRef.current = 0;
    pitchRef.current = 0;
    pressedKeysRef.current.clear();

    if (!skipSupportCheck && !supportsWebGL()) {
      setInitError('3D preview unavailable in this environment.');
      return undefined;
    }

    let renderer: RendererLike | null = null;
    try {
      renderer = rendererFactory({ antialias: true, alpha: true });
    } catch (error) {
      console.warn('SceneRoot: failed to create renderer', error);
      setInitError('3D renderer failed to start.');
      return undefined;
    }

    const { width, height } = measureSize(mountEl);
    const shadowsEnabled = enableShadows && quality !== 'low';
    renderer.shadowMap.enabled = shadowsEnabled;
    const basePixelRatio = quality === 'high' ? Math.min(window.devicePixelRatio || 1, 2) : quality === 'medium' ? 1.25 : 1;
    const pixelRatio = enableShadows ? basePixelRatio : Math.min(basePixelRatio, 1);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1224);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    const cameraRig = new THREE.Group();
    const pitchGroup = new THREE.Group();
    camera.position.set(0, 1.4, 3.6);
    pitchGroup.add(camera);
    cameraRig.add(pitchGroup);
    cameraRig.position.set(0, 0.3, 0);
    scene.add(cameraRig);

    const preset = lightingPresets[quality] ?? lightingPresets.high;
    const { ambient, hemi, key } = lights;
    ambient.intensity = preset.ambient;
    hemi.intensity = preset.hemi;
    key.intensity = preset.key;
    key.position.set(2.5, 4, 1.5);
    key.castShadow = shadowsEnabled;

    scene.add(ambient, hemi, key);

    const floorGeometry = new THREE.PlaneGeometry(12, 12);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x111827 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    floor.receiveShadow = shadowsEnabled;
    scene.add(floor);

    const platformGeometry = new THREE.BoxGeometry(1.4, 0.6, 1.4);
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      emissive: 0x0b1224,
      metalness: 0.15,
      roughness: 0.35,
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.set(0, 0.3, 0);
    platform.castShadow = shadowsEnabled;
    platform.receiveShadow = shadowsEnabled;
    scene.add(platform);

    const staticObstacles: { position: THREE.Vector3; radius: number }[] = [
      { position: platform.position.clone(), radius: 0.9 },
    ];

    const npcTorsoGeometry = new THREE.CapsuleGeometry(0.22, 0.55, 4, 8);
    const npcHeadGeometry = new THREE.SphereGeometry(0.18, 14, 10);
    const npcMaterials: THREE.Material[] = [];
    const npcGroups: THREE.Group[] = [];
    const npcSeed = quality === 'high' ? 4242 : quality === 'medium' ? 3141 : 2027;
    const npcCreateRng = createRng(npcSeed);
    const npcStepRng = createRng(npcSeed + 97);
    const npcCount = enableNpcCrowdSim ? npcCountByQuality[quality] : 0;
    const npcStates = npcCount ? createNpcStates({ count: npcCount, seed: npcSeed }, npcCreateRng) : [];
    const npcProfiles = npcCount ? generateNearbyUsers({ seed: profileSeed ?? npcSeed, count: npcCount }) : [];
    const npcChatState = npcCount ? createNpcChatState({ npcCount, seed: npcSeed + 211 }) : null;
    const npcChatRng = npcCount ? createRng(npcSeed + 503) : null;
    const chatOverlay = npcCount ? document.createElement('div') : null;
    const fpsOverlay = document.createElement('div');
    if (chatOverlay) {
      chatOverlay.style.position = 'absolute';
      chatOverlay.style.inset = '0';
      chatOverlay.style.pointerEvents = 'none';
      chatOverlay.style.display = 'block';
      chatOverlay.setAttribute('aria-live', 'polite');
      chatOverlay.setAttribute('data-testid', 'npc-chat-layer');
      mountEl.appendChild(chatOverlay);
    }
    fpsOverlay.style.position = 'absolute';
    fpsOverlay.style.right = '8px';
    fpsOverlay.style.top = '8px';
    fpsOverlay.style.padding = '6px 10px';
    fpsOverlay.style.fontSize = '12px';
    fpsOverlay.style.color = '#e5e7eb';
    fpsOverlay.style.background = 'rgba(15, 23, 42, 0.7)';
    fpsOverlay.style.border = '1px solid rgba(148, 163, 184, 0.4)';
    fpsOverlay.style.borderRadius = '10px';
    fpsOverlay.style.pointerEvents = 'none';
    fpsOverlay.style.boxShadow = '0 6px 18px rgba(0,0,0,0.25)';
    fpsOverlay.setAttribute('data-testid', 'fps-overlay');
    fpsOverlay.textContent = 'FPS: --';
    mountEl.appendChild(fpsOverlay);
    const chatBubbles: {
      id: string;
      npcIndex: number;
      ttl: number;
      age: number;
      element: HTMLDivElement;
    }[] = [];
    let chatId = 0;

    const spawnNpc = (stateIndex: number) => {
      const state = npcStates[stateIndex];
      const group = new THREE.Group();
      group.userData.npcIndex = stateIndex;
      const torsoMaterial = new THREE.MeshStandardMaterial({ color: state.color, metalness: 0.04, roughness: 0.55 });
      const headMaterial = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, metalness: 0.02, roughness: 0.65 });
      npcMaterials.push(torsoMaterial, headMaterial);

      const torso = new THREE.Mesh(npcTorsoGeometry, torsoMaterial);
      torso.castShadow = shadowsEnabled;
      torso.receiveShadow = shadowsEnabled;
      const head = new THREE.Mesh(npcHeadGeometry, headMaterial);
      head.position.set(0, 0.58, 0);
      head.castShadow = shadowsEnabled;
      head.receiveShadow = shadowsEnabled;

      group.add(torso);
      group.add(head);
      group.position.copy(state.position);
      npcGroups.push(group);
      scene.add(group);
    };

    for (let i = 0; i < npcStates.length; i += 1) {
      spawnNpc(i);
    }

    let loadedScene: THREE.Object3D | null = null;
    if (loadScene && gltfUrl) {
      try {
        const loader = loaderFactory();
        loader.load(
          gltfUrl,
          (gltf) => {
            loadedScene = gltf.scene;
            gltf.scene.traverse((node) => {
              const object = node as THREE.Object3D;
              object.castShadow = shadowsEnabled;
              object.receiveShadow = shadowsEnabled;
            });
            scene.add(gltf.scene);

            const bounds = new THREE.Box3().setFromObject(gltf.scene);
            const sphere = bounds.getBoundingSphere(new THREE.Sphere());
            if (sphere.radius > 0 && Number.isFinite(sphere.radius)) {
              staticObstacles.push({ position: sphere.center.clone(), radius: sphere.radius + 0.6 });
            }
          },
          undefined,
          (error) => {
            console.warn('SceneRoot: GLTF load failed', error);
            setModelError('Scene model unavailable; showing fallback pad.');
          },
        );
      } catch (error) {
        console.warn('SceneRoot: GLTF loader failed to start', error);
        setModelError('Scene model unavailable; showing fallback pad.');
      }
    }

    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.setAttribute('aria-label', '3D scene viewport');
    mountEl.appendChild(renderer.domElement);

    const pointerLockSupported = typeof renderer.domElement.requestPointerLock === 'function';
    const lookSensitivity = quality === 'high' ? 0.0022 : quality === 'medium' ? 0.002 : 0.0016;
    const touchLookScale = quality === 'high' ? 0.012 : quality === 'medium' ? 0.01 : 0.008;
    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
    const handlePointerLockChange = () => {
      pointerLockedRef.current = document.pointerLockElement === renderer?.domElement;
    };
    const handleClick = () => {
      if (!pointerLockSupported) return;
      renderer?.domElement.requestPointerLock();
    };
    const handleMouseMove = (event: MouseEvent) => {
      const locked = pointerLockedRef.current;
      const dragging = (event.buttons & 1) === 1;
      if (!locked && !dragging) return;
      yawRef.current -= event.movementX * lookSensitivity;
      pitchRef.current = clamp(pitchRef.current - event.movementY * lookSensitivity, -1.2, 1.2);
    };

    if (pointerLockSupported) {
      renderer.domElement.addEventListener('click', handleClick);
      document.addEventListener('pointerlockchange', handlePointerLockChange);
    }
    renderer.domElement.addEventListener('mousemove', handleMouseMove);

    const overlaySize = { width: width || 1, height: height || 1 };
    const handleResize = () => {
      const size = measureSize(mountEl);
      overlaySize.width = size.width;
      overlaySize.height = size.height;
      const aspect = size.width / size.height || 1;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer?.setSize(size.width, size.height, false);
    };

    const createPlayer = () => {
      const group = new THREE.Group();
      const torso = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.28, 0.65, 4, 8),
        new THREE.MeshStandardMaterial({ color: 0x7dd3fc, metalness: 0.05, roughness: 0.5 }),
      );
      torso.castShadow = shadowsEnabled;
      torso.receiveShadow = shadowsEnabled;

      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 12),
        new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.05, roughness: 0.6 }),
      );
      head.position.set(0, 0.65, 0);
      head.castShadow = shadowsEnabled;
      head.receiveShadow = shadowsEnabled;

      group.add(torso);
      group.add(head);
      group.userData.isPlayer = true;
      group.position.set(0, 0.3, 0);
      playerRef.current = group;
      scene.add(group);
    };

    createPlayer();

    const detachKeyTracking = trackKeyPresses(pressedKeysRef.current);
    const moveVector = new THREE.Vector3();
    const upAxis = new THREE.Vector3(0, 1, 0);
    const clock = new THREE.Clock();
    const baseY = 0.3;
    const speed = quality === 'low' ? 2.1 : 2.6;
    const separationRadius = 0.8;
    const npcSeparationRadius = 0.7;
    const separationVector = new THREE.Vector3();
    const fpsMeter = createFpsMeter();

    const raycaster = raycasterFactory ? raycasterFactory() : new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const pickAvatar = (event: PointerEvent) => {
      const rect = renderer?.domElement.getBoundingClientRect();
      const targetWidth = overlaySize.width;
      const targetHeight = overlaySize.height;
      const offsetX = rect ? event.clientX - rect.left : event.offsetX;
      const offsetY = rect ? event.clientY - rect.top : event.offsetY;
      pointer.x = (offsetX / targetWidth) * 2 - 1;
      pointer.y = -(offsetY / targetHeight) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const objectsToPick = playerRef.current ? [...npcGroups, playerRef.current] : npcGroups;
      const hits = raycaster.intersectObjects(objectsToPick, true);
      if (!hits.length) return;
      const hit = hits[0];
      let object: THREE.Object3D | null = hit.object;
      while (object && object.parent && object.userData?.npcIndex === undefined && !object.userData?.isPlayer) {
        object = object.parent;
      }
      if (!object) return;
      if (object.userData?.isPlayer) {
        if (playerProfile && onSelectProfile) {
          onSelectProfile(playerProfile);
        }
        return;
      }
      const npcIndex: number | undefined = object.userData?.npcIndex;
      if (npcIndex === undefined) return;
      const profile = npcProfiles[npcIndex];
      if (profile && onSelectProfile) {
        onSelectProfile(profile);
      }
    };

    const projectBubble = (bubble: { npcIndex: number; element: HTMLDivElement; age: number; ttl: number }) => {
      const group = npcGroups[bubble.npcIndex];
      if (!group) return;
      const world = group.position.clone();
      world.y += 1.1;
      world.project(camera);
      const x = (world.x * 0.5 + 0.5) * overlaySize.width;
      const y = (-world.y * 0.5 + 0.5) * overlaySize.height;
      const fade = Math.max(0, Math.min(1, 1 - bubble.age / bubble.ttl));
      bubble.element.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
      bubble.element.style.opacity = `${fade}`;
    };

    let frameId = 0;
    let usingAnimationLoop = false;
    const renderLoop = () => {
      const dt = clock.getDelta();
      const player = playerRef.current;
      const move2 = computeMoveVector(pressedKeysRef.current);
      moveVector.set(move2.x, 0, move2.z);

      if (npcStates.length && npcChatState && npcChatRng && chatOverlay) {
        stepNpcGroup(npcStates, dt, npcStepRng);
        const spawned = stepNpcChat(npcChatState, dt, npcChatRng);
        for (const msg of spawned) {
          const bubble = document.createElement('div');
          bubble.textContent = msg.text;
          bubble.style.position = 'absolute';
          bubble.style.padding = '6px 10px';
          bubble.style.borderRadius = '12px';
          bubble.style.background = 'rgba(17, 24, 39, 0.9)';
          bubble.style.color = '#e5e7eb';
          bubble.style.fontSize = '12px';
          bubble.style.backdropFilter = 'blur(4px)';
          bubble.style.boxShadow = '0 6px 18px rgba(0,0,0,0.25)';
          bubble.style.transition = 'opacity 0.15s linear';
          bubble.style.pointerEvents = 'none';
          bubble.setAttribute('role', 'status');
          chatOverlay.appendChild(bubble);
          chatBubbles.push({ id: `${msg.id}-${chatId}`, npcIndex: msg.npcIndex, ttl: msg.ttl, age: 0, element: bubble });
          chatId += 1;
        }
        for (let i = chatBubbles.length - 1; i >= 0; i -= 1) {
          const bubble = chatBubbles[i];
          bubble.age += dt;
          if (bubble.age >= bubble.ttl) {
            chatOverlay.removeChild(bubble.element);
            chatBubbles.splice(i, 1);
          } else {
            projectBubble(bubble);
          }
        }
        npcStates.forEach((npc, idx) => {
          if (npc.state === 'idle') {
            npc.phase += dt * 1.5;
          }
          const bob = npc.state === 'walk' ? Math.sin(npc.phase) * 0.04 : Math.sin(npc.phase * 0.6) * 0.02;
          const group = npcGroups[idx];
          npc.position.y = baseY;
          group.position.set(npc.position.x, npc.position.y + bob, npc.position.z);
          group.rotation.y = npc.heading;
        });
      }

      const touchMove = mobileMoveRef?.current;
      if (touchMove) {
        moveVector.x += touchMove.x;
        moveVector.z += touchMove.z;
      }

      const magnitude = moveVector.length();
      if (magnitude > 1) {
        moveVector.divideScalar(magnitude);
      }

      const isMoving = moveVector.lengthSq() > 0.0001;

      if (player && isMoving) {
        moveVector.applyAxisAngle(upAxis, yawRef.current);
        moveVector.normalize();
        player.position.addScaledVector(moveVector, speed * dt);
        player.rotation.y = Math.atan2(moveVector.x, moveVector.z);
        walkPhaseRef.current += dt * 9;
      } else if (player) {
        walkPhaseRef.current = 0;
      }

      if (player && npcGroups.length) {
        for (let i = 0; i < npcGroups.length; i += 1) {
          const npc = npcGroups[i];
          separationVector.subVectors(player.position, npc.position);
          separationVector.y = 0;
          let dist = separationVector.length();
          if (dist < 1e-4) {
            separationVector.set(0.0001, 0, 0.0001);
            dist = separationVector.length();
          }
          if (dist < separationRadius) {
            const push = (separationRadius - dist) * 0.5;
            const dir = separationVector.normalize();
            player.position.addScaledVector(dir, push);
            const npcState = npcStates[i];
            if (npcState) {
              npcState.position.addScaledVector(dir, -push);
              npc.position.copy(npcState.position);
            } else {
              npc.position.addScaledVector(dir, -push);
            }
          }
        }
      }

      if (npcGroups.length > 1) {
        for (let i = 0; i < npcGroups.length; i += 1) {
          for (let j = i + 1; j < npcGroups.length; j += 1) {
            const a = npcGroups[i];
            const b = npcGroups[j];
            separationVector.subVectors(a.position, b.position);
            separationVector.y = 0;
            let dist = separationVector.length();
            if (dist < 1e-4) {
              separationVector.set(0.0001, 0, 0.0001);
              dist = separationVector.length();
            }
            if (dist < npcSeparationRadius) {
              const push = (npcSeparationRadius - dist) * 0.5;
              const dir = separationVector.normalize();
              a.position.addScaledVector(dir, push);
              b.position.addScaledVector(dir, -push);
              const aState = npcStates[i];
              const bState = npcStates[j];
              if (aState) aState.position.copy(a.position);
              if (bState) bState.position.copy(b.position);
            }
          }
        }
      }

      if (staticObstacles.length) {
        const applyObstaclePush = (pos: THREE.Vector3, radius: number) => {
          for (const obstacle of staticObstacles) {
            separationVector.subVectors(pos, obstacle.position);
            separationVector.y = 0;
            const dist = separationVector.length();
            if (dist > obstacle.radius + radius) continue;
            const overlap = obstacle.radius + radius - dist;
            if (overlap <= 0) continue;
            if (dist < 1e-4) {
              separationVector.set(0.0001, 0, 0.0001);
            }
            separationVector.normalize();
            pos.addScaledVector(separationVector, overlap);
          }
        };

        if (player) {
          applyObstaclePush(player.position, 0.35);
        }
        for (let i = 0; i < npcGroups.length; i += 1) {
          const npc = npcGroups[i];
          applyObstaclePush(npc.position, 0.35);
          const state = npcStates[i];
          if (state) state.position.copy(npc.position);
        }
      }

      if (player) {
        player.position.y = baseY;
        if (isMoving) {
          player.position.y = baseY + Math.sin(walkPhaseRef.current) * 0.05;
        }
      }

      const mobileLook = mobileLookDeltaRef?.current;
      if (mobileLook && (mobileLook.dx !== 0 || mobileLook.dy !== 0)) {
        yawRef.current -= mobileLook.dx * touchLookScale;
        pitchRef.current = clamp(pitchRef.current - mobileLook.dy * touchLookScale, -1.2, 1.2);
        mobileLook.dx = 0;
        mobileLook.dy = 0;
      }

      if (player) {
        cameraRig.position.lerp(player.position, 0.35);
      }
      cameraRig.rotation.y = yawRef.current;
      pitchGroup.rotation.x = pitchRef.current;

      const fps = fpsMeter.tick(performance.now());
      fpsOverlay.textContent = `FPS: ${Number.isFinite(fps) ? fps.toFixed(0) : '--'}`;

      platform.rotation.y += 0.01;
      renderer?.render(scene, camera);
      if (!usingAnimationLoop) {
        frameId = requestAnimationFrame(renderLoop);
      }
    };

    if (typeof renderer.setAnimationLoop === 'function') {
      usingAnimationLoop = true;
      renderer.setAnimationLoop(renderLoop);
    } else {
      frameId = requestAnimationFrame(renderLoop);
    }
    window.addEventListener('resize', handleResize);
    renderer.domElement.addEventListener('pointerup', pickAvatar);

    return () => {
      if (usingAnimationLoop && typeof renderer?.setAnimationLoop === 'function') {
        renderer.setAnimationLoop(null);
      } else {
        cancelAnimationFrame(frameId);
      }
      window.removeEventListener('resize', handleResize);
      renderer?.domElement.removeEventListener('pointerup', pickAvatar);
      detachKeyTracking.detach();
      renderer?.domElement.removeEventListener('mousemove', handleMouseMove);
      if (pointerLockSupported) {
        renderer?.domElement.removeEventListener('click', handleClick);
        document.removeEventListener('pointerlockchange', handlePointerLockChange);
        if (document.pointerLockElement === renderer?.domElement) {
          document.exitPointerLock?.();
        }
      }
      if (loadedScene) {
        scene.remove(loadedScene);
      }
      if (playerRef.current) {
        scene.remove(playerRef.current);
        playerRef.current = null;
      }
      for (const npc of npcGroups) {
        scene.remove(npc);
      }
      scene.remove(cameraRig);
      scene.remove(platform);
      scene.remove(floor);
      if (mountEl.contains(fpsOverlay)) {
        mountEl.removeChild(fpsOverlay);
      }
      if (renderer && mountEl.contains(renderer.domElement)) {
        mountEl.removeChild(renderer.domElement);
      }
      if (chatOverlay && mountEl.contains(chatOverlay)) {
        mountEl.removeChild(chatOverlay);
      }
      chatBubbles.splice(0, chatBubbles.length);
      renderer?.dispose();
      platformGeometry.dispose();
      platformMaterial.dispose();
      floorGeometry.dispose();
      floorMaterial.dispose();
      npcTorsoGeometry.dispose();
      npcHeadGeometry.dispose();
      npcMaterials.forEach((mat) => mat.dispose());
      renderer = null;
    };
  }, [enableNpcCrowdSim, enableShadows, gltfUrl, lights, loadScene, loaderFactory, mobileLookDeltaRef, mobileMoveRef, onSelectProfile, playerProfile, profileSeed, quality, raycasterFactory, rendererFactory, skipSupportCheck]);

  return (
    <div className="scene-root" ref={mountRef} data-testid="scene-root">
      {initError ? (
        <div className="scene-fallback" role="status">
          {initError}
        </div>
      ) : null}
      {modelError ? (
        <div className="scene-overlay" role="status">
          {modelError}
        </div>
      ) : null}
    </div>
  );
}

export default SceneRoot;
