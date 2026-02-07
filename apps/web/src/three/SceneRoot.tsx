import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

type RendererFactoryOptions = {
  antialias: boolean;
  alpha: boolean;
};

type RendererLike = {
  domElement: HTMLCanvasElement;
  shadowMap: { enabled: boolean };
  setSize: (width: number, height: number, updateStyle?: boolean) => void;
  setPixelRatio: (ratio: number) => void;
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
}: SceneRootProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const lights = useMemo(() => ({
    ambient: new THREE.AmbientLight(0xffffff, 0.35),
    hemi: new THREE.HemisphereLight(0x7dd3fc, 0x0f172a, 0.45),
    key: new THREE.DirectionalLight(0xffffff, 1.1),
  }), []);

  useEffect(() => {
    const mountEl = mountRef.current;
    if (!mountEl) {
      return undefined;
    }

    setInitError(null);
    setModelError(null);

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
    const pixelRatio = quality === 'high' ? Math.min(window.devicePixelRatio || 1, 2) : quality === 'medium' ? 1.25 : 1;
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1224);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 1.6, 4);

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

    const handleResize = () => {
      const size = measureSize(mountEl);
      const aspect = size.width / size.height || 1;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer?.setSize(size.width, size.height, false);
    };

    let frameId = 0;
    const renderLoop = () => {
      platform.rotation.y += 0.01;
      renderer?.render(scene, camera);
      frameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      if (loadedScene) {
        scene.remove(loadedScene);
      }
      scene.remove(platform);
      scene.remove(floor);
      if (renderer && mountEl.contains(renderer.domElement)) {
        mountEl.removeChild(renderer.domElement);
      }
      renderer?.dispose();
      platformGeometry.dispose();
      platformMaterial.dispose();
      floorGeometry.dispose();
      floorMaterial.dispose();
      renderer = null;
    };
  }, [enableShadows, gltfUrl, lights, loadScene, loaderFactory, quality, rendererFactory, skipSupportCheck]);

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
