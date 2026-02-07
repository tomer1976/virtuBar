import { MutableRefObject, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { computeMoveVector, trackKeyPresses } from './input';
import { createFpsMeter } from './fpsMeter';
import { createNpcStates, createRng, stepNpcGroup } from './sim/npcSim';
import { createNpcChatState, stepNpcChat } from './sim/npcChat';
import { generateNearbyUsers, NearbyUser } from '../state/mockNearby';
import { TransformSmoother } from '../net/realtime/transformSmoother';
import { detectDeviceType } from '../net/realtime/rateLimitedProvider';
import { AvatarTransformState, RealtimeProvider, RoomMemberState } from '../net/realtime/types';

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
  roomId?: string;
  selfUserId?: string;
  roomMembers?: RoomMemberState[];
  sendTransform?: (transform: Omit<AvatarTransformState, 'roomId' | 'seq'>) => Promise<void>;
  realtimeProvider?: RealtimeProvider;
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
  gltfUrl = '/models/bar_venue_50p_avatar_scaled.glb',
  loadScene = true,
  quality = 'high',
  mobileMoveRef,
  mobileLookDeltaRef,
  profileSeed,
  onSelectProfile,
  playerProfile,
  raycasterFactory,
  enableNpcCrowdSim = true,
  roomId,
  selfUserId,
  roomMembers,
  sendTransform,
  realtimeProvider,
}: SceneRootProps): JSX.Element {
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
  const roomMembersRef = useRef<RoomMemberState[]>(roomMembers ?? []);
  const realtimeSyncRef = useRef<{ syncMembers?: (members: RoomMemberState[]) => void } | null>(null);
  const lastTransformSentAtRef = useRef<number>(-Infinity);
  const deviceType = useMemo(() => detectDeviceType(), []);
  const transformIntervalMs = useMemo(() => (deviceType === 'mobile' ? 70 : 50), [deviceType]);
  const idleTransformIntervalMs = 900;

  useEffect(() => {
    roomMembersRef.current = roomMembers ?? [];
    realtimeSyncRef.current?.syncMembers?.(roomMembers ?? []);
  }, [roomMembers]);

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

    const staticObstacles: { center: THREE.Vector3; half: THREE.Vector3 }[] = [];

    let navBoundary: THREE.Sphere | null = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 4.2);
    const separationVector = new THREE.Vector3();

    const applyObstaclePush = (pos: THREE.Vector3, radius: number) => {
      if (!staticObstacles.length) return;
      for (const obstacle of staticObstacles) {
        const dx = pos.x - obstacle.center.x;
        const dz = pos.z - obstacle.center.z;
        const px = obstacle.half.x + radius;
        const pz = obstacle.half.z + radius;
        if (Math.abs(dx) > px || Math.abs(dz) > pz) continue;

        const penX = px - Math.abs(dx);
        const penZ = pz - Math.abs(dz);
        if (penX < penZ) {
          pos.x = obstacle.center.x + Math.sign(dx || 1) * px;
        } else {
          pos.z = obstacle.center.z + Math.sign(dz || 1) * pz;
        }
      }
    };

    const clampToNavBoundary = (pos: THREE.Vector3, radius: number) => {
      if (!navBoundary) return;
      separationVector.subVectors(pos, navBoundary.center);
      const dist = separationVector.length();
      const maxDist = Math.max(navBoundary.radius - radius, 0.5);
      if (dist > maxDist) {
        separationVector.setLength(maxDist);
        pos.copy(navBoundary.center).add(separationVector);
      }
    };

    const pelvisGeometry = new THREE.BoxGeometry(0.34, 0.16, 0.24);
    const torsoGeometry = new THREE.BoxGeometry(0.38, 0.52, 0.26);
    const armGeometry = new THREE.CylinderGeometry(0.07, 0.07, 0.45, 10);
    const legGeometry = new THREE.CylinderGeometry(0.09, 0.09, 0.55, 12);
    const handGeometry = new THREE.SphereGeometry(0.07, 10, 10);
    const footGeometry = new THREE.BoxGeometry(0.18, 0.08, 0.32);
    const headGeometry = new THREE.SphereGeometry(0.18, 14, 12);
    const eyeGeometry = new THREE.SphereGeometry(0.03, 8, 8);
    const noseGeometry = new THREE.BoxGeometry(0.04, 0.04, 0.04);
    const mouthGeometry = new THREE.BoxGeometry(0.1, 0.03, 0.02);

    const buildHumanoidAvatar = (options: {
      torsoColor: number;
      skinColor: number;
      pantsColor: number;
      shoeColor: number;
      headColor: number;
      accentColor?: number;
    }) => {
      const materials: THREE.Material[] = [];
      const makeMaterial = (color: number, metalness = 0.06, roughness = 0.5) => {
        const mat = new THREE.MeshStandardMaterial({ color, metalness, roughness });
        materials.push(mat);
        return mat;
      };
      const addMesh = (geometry: THREE.BufferGeometry, material: THREE.Material) => {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = shadowsEnabled;
        mesh.receiveShadow = shadowsEnabled;
        return mesh;
      };

      const group = new THREE.Group();

      const leftLeg = addMesh(legGeometry, makeMaterial(options.pantsColor, 0.08, 0.55));
      leftLeg.position.set(-0.12, 0.275, 0);
      const rightLeg = addMesh(legGeometry, makeMaterial(options.pantsColor, 0.08, 0.55));
      rightLeg.position.set(0.12, 0.275, 0);

      const leftFoot = addMesh(footGeometry, makeMaterial(options.shoeColor, 0.1, 0.6));
      leftFoot.position.set(-0.12, 0.04, 0.07);
      const rightFoot = addMesh(footGeometry, makeMaterial(options.shoeColor, 0.1, 0.6));
      rightFoot.position.set(0.12, 0.04, 0.07);

      const pelvis = addMesh(pelvisGeometry, makeMaterial(options.pantsColor, 0.07, 0.52));
      pelvis.position.set(0, 0.63, 0);

      const torso = addMesh(torsoGeometry, makeMaterial(options.torsoColor, 0.08, 0.48));
      torso.position.set(0, 0.97, 0);

      const leftArm = addMesh(armGeometry, makeMaterial(options.torsoColor, 0.08, 0.48));
      leftArm.position.set(-0.32, 0.98, 0);
      leftArm.rotation.z = 0.12;
      const rightArm = addMesh(armGeometry, makeMaterial(options.torsoColor, 0.08, 0.48));
      rightArm.position.set(0.32, 0.98, 0);
      rightArm.rotation.z = -0.12;

      const leftHand = addMesh(handGeometry, makeMaterial(options.skinColor, 0.05, 0.62));
      leftHand.position.set(-0.32, 0.74, 0);
      const rightHand = addMesh(handGeometry, makeMaterial(options.skinColor, 0.05, 0.62));
      rightHand.position.set(0.32, 0.74, 0);

      const head = addMesh(headGeometry, makeMaterial(options.headColor, 0.05, 0.6));
      head.position.set(0, 1.33, 0);

      const eyeMaterial = makeMaterial(0x0f172a, 0.02, 0.35);
      const leftEye = addMesh(eyeGeometry, eyeMaterial);
      leftEye.position.set(-0.05, 1.34, 0.17);
      const rightEye = addMesh(eyeGeometry, eyeMaterial);
      rightEye.position.set(0.05, 1.34, 0.17);

      const nose = addMesh(noseGeometry, makeMaterial(options.headColor, 0.03, 0.6));
      nose.position.set(0, 1.3, 0.18);
      const mouth = addMesh(mouthGeometry, makeMaterial(options.accentColor ?? 0xd946ef, 0.04, 0.4));
      mouth.position.set(0, 1.23, 0.17);

      const hairColor = options.accentColor ?? 0x475569;
      const hair = addMesh(
        new THREE.SphereGeometry(0.19, 12, 10, 0, Math.PI * 2, 0, Math.PI / 1.3),
        makeMaterial(hairColor, 0.08, 0.5),
      );
      hair.position.set(0, 1.38, 0);
      hair.scale.set(1, 0.6, 1);

      group.add(
        leftLeg,
        rightLeg,
        leftFoot,
        rightFoot,
        pelvis,
        torso,
        leftArm,
        rightArm,
        leftHand,
        rightHand,
        head,
        leftEye,
        rightEye,
        nose,
        mouth,
        hair,
      );

      return { group, materials };
    };
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
    const npcTransformSmoothers = npcCount
      ? Array.from({ length: npcCount }, () => new TransformSmoother({ bufferMs: 140, snapDistance: 2 }))
      : [];
    const npcSeqCounters = npcCount ? Array.from({ length: npcCount }, () => 0) : [];
    const remoteAvatarGroups: THREE.Group[] = [];
    const remoteAvatars = new Map<
      string,
      { group: THREE.Group; smoother: TransformSmoother; materials: THREE.Material[] }
    >();

    const hashUserId = (id: string) => {
      let hash = 0;
      for (let i = 0; i < id.length; i += 1) {
        hash = (hash * 31 + id.charCodeAt(i)) | 0;
      }
      return Math.abs(hash);
    };

    const remoteColorForUser = (id: string) => {
      const palette = [0x38bdf8, 0xa855f7, 0xf97316, 0x22c55e, 0xf43f5e, 0x14b8a6];
      return palette[hashUserId(id) % palette.length];
    };

    const ensureRemoteAvatar = (member: RoomMemberState) => {
      if (!member || member.userId === selfUserId) return null;
      let entry = remoteAvatars.get(member.userId);
      if (!entry) {
        const { group, materials } = buildHumanoidAvatar({
          torsoColor: remoteColorForUser(member.userId),
          skinColor: 0xe8d5b5,
          pantsColor: 0x111827,
          shoeColor: 0x0f172a,
          headColor: 0xf8fafc,
          accentColor: 0x7c3aed,
        });
        group.userData.userId = member.userId;
        scene.add(group);
        remoteAvatarGroups.push(group);
        entry = {
          group,
          smoother: new TransformSmoother({ bufferMs: 120, snapDistance: 1.8, snapRotation: Math.PI / 1.4 }),
          materials,
        };
        remoteAvatars.set(member.userId, entry);
      }
      entry.group.position.set(member.x ?? 0, member.y ?? 0.3, member.z ?? 0);
      entry.group.rotation.y = member.rotY ?? 0;
      return entry;
    };

    const removeRemoteAvatar = (userId: string) => {
      const entry = remoteAvatars.get(userId);
      if (!entry) return;
      scene.remove(entry.group);
      const idx = remoteAvatarGroups.indexOf(entry.group);
      if (idx >= 0) remoteAvatarGroups.splice(idx, 1);
      entry.materials.forEach((mat) => mat.dispose());
      remoteAvatars.delete(userId);
    };

    const syncRemoteMembers = (members: RoomMemberState[]) => {
      const seen = new Set<string>();
      const nowTs = typeof performance !== 'undefined' ? performance.now() : Date.now();
      members.forEach((member) => {
        if (!member || member.userId === selfUserId) return;
        seen.add(member.userId);
        const entry = ensureRemoteAvatar(member);
        if (entry) {
          entry.smoother.ingestSample({
            userId: member.userId,
            seq: 0,
            x: member.x,
            y: member.y,
            z: member.z,
            rotY: member.rotY,
            anim: member.anim,
            speaking: member.speaking,
            ts: nowTs,
          });
        }
      });
      remoteAvatars.forEach((_entry, userId) => {
        if (!seen.has(userId)) removeRemoteAvatar(userId);
      });
    };

    syncRemoteMembers(roomMembersRef.current);
    realtimeSyncRef.current = { syncMembers: syncRemoteMembers };
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
      const { group, materials } = buildHumanoidAvatar({
        torsoColor: state.color,
        skinColor: 0xe8d5b5,
        pantsColor: 0x111827,
        shoeColor: 0x0f172a,
        headColor: 0xf8fafc,
        accentColor: 0x94a3b8,
      });
      group.userData.npcIndex = stateIndex;
      npcMaterials.push(...materials);
      group.position.copy(state.position);
      npcGroups.push(group);
      scene.add(group);
    };

    for (let i = 0; i < npcStates.length; i += 1) {
      spawnNpc(i);
    }

    let loadedScene: THREE.Object3D | null = null;
    const venueScale = 1.5;
    const navMargin = 0.5;

    if (loadScene && gltfUrl) {
      try {
        const loader = loaderFactory();
        loader.load(
          gltfUrl,
          (gltf) => {
            loadedScene = gltf.scene;
            gltf.scene.scale.setScalar(venueScale);

            const obstacleMeshes: THREE.Mesh[] = [];
            const obstacleBlacklist = ['Floor', 'Ceiling', 'Door'];

            gltf.scene.traverse((node) => {
              const object = node as THREE.Object3D;
              const name = object.name ?? '';

              if (name.startsWith('Chair')) {
                object.scale.multiplyScalar(1.0);
              } else if (name.startsWith('Table')) {
                object.scale.multiplyScalar(1.0);
              } else if (name.startsWith('BarCounter')) {
                object.scale.x *= 1.05;
                object.scale.y *= 1.15;
                object.scale.z *= 1.05;
              }

              if (object instanceof THREE.Mesh) {
                if (!obstacleBlacklist.some((prefix) => name.startsWith(prefix))) {
                  obstacleMeshes.push(object);
                }
              }

              object.castShadow = shadowsEnabled;
              object.receiveShadow = shadowsEnabled;
            });

            gltf.scene.updateMatrixWorld(true);
            scene.add(gltf.scene);

            for (const mesh of obstacleMeshes) {
              const box = new THREE.Box3().setFromObject(mesh);
              const center = box.getCenter(new THREE.Vector3());
              const half = box.getSize(new THREE.Vector3()).multiplyScalar(0.5);
              if (!Number.isFinite(half.x) || !Number.isFinite(half.z)) continue;
              if (half.x > 4 || half.z > 4) continue;
              half.x += 0.08;
              half.z += 0.08;
              staticObstacles.push({ center, half });
            }

            const bounds = new THREE.Box3().setFromObject(gltf.scene);
            const sphere = bounds.getBoundingSphere(new THREE.Sphere());
            if (sphere.radius > 0 && Number.isFinite(sphere.radius)) {
              const radius = Math.max(2.4, sphere.radius - navMargin);
              navBoundary = new THREE.Sphere(sphere.center.clone(), radius);
              if (playerRef.current) {
                playerRef.current.position.set(sphere.center.x, playerRef.current.position.y, sphere.center.z);
                applyObstaclePush(playerRef.current.position, 0.32);
                clampToNavBoundary(playerRef.current.position, 0.32);
              }
              for (let i = 0; i < npcGroups.length; i += 1) {
                const npc = npcGroups[i];
                npc.position.set(sphere.center.x, npc.position.y, sphere.center.z);
                applyObstaclePush(npc.position, 0.32);
                clampToNavBoundary(npc.position, 0.32);
                const state = npcStates[i];
                if (state) state.position.copy(npc.position);
              }
              for (let i = 0; i < remoteAvatarGroups.length; i += 1) {
                const remote = remoteAvatarGroups[i];
                remote.position.set(sphere.center.x, remote.position.y, sphere.center.z);
                applyObstaclePush(remote.position, 0.32);
                clampToNavBoundary(remote.position, 0.32);
              }
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
      const { group, materials } = buildHumanoidAvatar({
        torsoColor: 0x7dd3fc,
        skinColor: 0xe8d5b5,
        pantsColor: 0x1f2937,
        shoeColor: 0x0f172a,
        headColor: 0xe2e8f0,
        accentColor: 0x38bdf8,
      });
      npcMaterials.push(...materials);
      group.userData.isPlayer = true;
      group.position.set(0, 0, 0);
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
    const fpsMeter = createFpsMeter();
    const unsubscribeTransform = realtimeProvider?.on('avatar_transform_broadcast', (event) => {
      if (event.payload.userId === selfUserId) return;
      const member = roomMembersRef.current.find((m) => m.userId === event.payload.userId);
      const fallbackMember: RoomMemberState = member ?? {
        userId: event.payload.userId,
        displayName: event.payload.userId,
        avatarId: 'sim',
        x: event.payload.x,
        y: event.payload.y,
        z: event.payload.z,
        rotY: event.payload.rotY,
        anim: event.payload.anim,
        speaking: event.payload.speaking,
      };
      const entry = ensureRemoteAvatar(fallbackMember);
      entry?.smoother.ingest(event);
    });

    const unsubscribeRoomState = realtimeProvider?.on('room_state', (event) => {
      syncRemoteMembers(event.payload.members);
    });

    const unsubscribeMemberLeft = realtimeProvider?.on('member_left', (event) => {
      removeRemoteAvatar(event.payload.userId);
    });

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
      const objectsToPick = playerRef.current
        ? [...npcGroups, ...remoteAvatarGroups, playerRef.current]
        : [...npcGroups, ...remoteAvatarGroups];
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
      const frameNow = typeof performance !== 'undefined' ? performance.now() : Date.now();
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
          const smoother = npcTransformSmoothers[idx];
          if (smoother) {
            const seq = (npcSeqCounters[idx] += 1);
            smoother.ingestSample({
              userId: npcProfiles[idx]?.id ?? `npc-${idx}`,
              seq,
              x: npc.position.x,
              y: npc.position.y,
              z: npc.position.z,
              rotY: npc.heading,
              anim: npc.state === 'walk' ? 'walk' : 'idle',
              speaking: false,
              ts: frameNow,
            });
            const smoothed = smoother.getSmoothed(frameNow);
            const targetX = smoothed?.x ?? npc.position.x;
            const targetZ = smoothed?.z ?? npc.position.z;
            const targetRot = smoothed?.rotY ?? npc.heading;
            const targetY = smoothed?.y ?? npc.position.y;
            group.position.set(targetX, targetY + bob, targetZ);
            group.rotation.y = targetRot;
          } else {
            group.position.set(npc.position.x, npc.position.y + bob, npc.position.z);
            group.rotation.y = npc.heading;
          }
        });
      }

      if (remoteAvatars.size) {
        remoteAvatars.forEach((entry) => {
          const smoothed = entry.smoother.getSmoothed(frameNow);
          if (!smoothed) return;
          const bob = smoothed.anim === 'walk' ? Math.sin(frameNow / 160) * 0.04 : 0;
          entry.group.position.set(smoothed.x, (smoothed.y ?? baseY) + bob, smoothed.z);
          entry.group.rotation.y = smoothed.rotY;
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
      }

      if (player) {
        applyObstaclePush(player.position, 0.32);
        clampToNavBoundary(player.position, 0.32);
      }

      for (let i = 0; i < npcGroups.length; i += 1) {
        const npc = npcGroups[i];
        applyObstaclePush(npc.position, 0.32);
        clampToNavBoundary(npc.position, 0.32);
        const state = npcStates[i];
        if (state) state.position.copy(npc.position);

        if (player) {
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
            if (state) {
              state.position.addScaledVector(dir, -push);
              npc.position.copy(state.position);
            } else {
              npc.position.addScaledVector(dir, -push);
            }
          }
        }
      }

      for (let i = 0; i < remoteAvatarGroups.length; i += 1) {
        applyObstaclePush(remoteAvatarGroups[i].position, 0.32);
        clampToNavBoundary(remoteAvatarGroups[i].position, 0.32);
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

      if (player && sendTransform && roomId) {
        const sinceLast = frameNow - lastTransformSentAtRef.current;
        const interval = isMoving ? transformIntervalMs : idleTransformIntervalMs;
        if (sinceLast >= interval) {
          lastTransformSentAtRef.current = frameNow;
          void sendTransform({
            x: player.position.x,
            y: player.position.y,
            z: player.position.z,
            rotY: player.rotation.y,
            anim: isMoving ? 'walk' : 'idle',
            speaking: false,
          });
        }
      }

      const fps = fpsMeter.tick(performance.now());
      fpsOverlay.textContent = `FPS: ${Number.isFinite(fps) ? fps.toFixed(0) : '--'}`;

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
      unsubscribeTransform?.();
      unsubscribeRoomState?.();
      unsubscribeMemberLeft?.();
      if (loadedScene) {
        scene.remove(loadedScene);
      }
      remoteAvatars.forEach((entry) => {
        scene.remove(entry.group);
        entry.materials.forEach((mat) => mat.dispose());
      });
      remoteAvatars.clear();
      remoteAvatarGroups.splice(0, remoteAvatarGroups.length);
      if (playerRef.current) {
        scene.remove(playerRef.current);
        playerRef.current = null;
      }
      for (const npc of npcGroups) {
        scene.remove(npc);
      }
      scene.remove(cameraRig);
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
      floorGeometry.dispose();
      floorMaterial.dispose();
      pelvisGeometry.dispose();
      torsoGeometry.dispose();
      armGeometry.dispose();
      legGeometry.dispose();
      handGeometry.dispose();
      footGeometry.dispose();
      headGeometry.dispose();
      eyeGeometry.dispose();
      noseGeometry.dispose();
      mouthGeometry.dispose();
      npcMaterials.forEach((mat) => mat.dispose());
      renderer = null;
    };
  }, [enableNpcCrowdSim, enableShadows, gltfUrl, idleTransformIntervalMs, lights, loadScene, loaderFactory, mobileLookDeltaRef, mobileMoveRef, onSelectProfile, playerProfile, profileSeed, quality, raycasterFactory, realtimeProvider, rendererFactory, roomId, selfUserId, sendTransform, skipSupportCheck, transformIntervalMs]);

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
