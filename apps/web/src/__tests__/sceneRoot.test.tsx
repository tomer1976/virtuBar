import { render, screen } from '@testing-library/react';
import { MutableRefObject } from 'react';
import { describe, expect, it, vi } from 'vitest';
import * as THREE from 'three';
import SceneRoot from '../three/SceneRoot';

type RendererStub = {
  domElement: HTMLCanvasElement;
  shadowMap: { enabled: boolean };
  setSize: ReturnType<typeof vi.fn>;
  setPixelRatio: ReturnType<typeof vi.fn>;
  render: ReturnType<typeof vi.fn>;
  dispose: ReturnType<typeof vi.fn>;
  setAnimationLoop?: (callback: ((time: number) => void) | null) => void;
};

function createRendererStub(): RendererStub {
  return {
    domElement: document.createElement('canvas'),
    shadowMap: { enabled: false },
    setSize: vi.fn(),
    setPixelRatio: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn(),
    setAnimationLoop: undefined,
  };
}

describe('SceneRoot', () => {
  it('mounts renderer canvas and disposes on unmount', () => {
    const renderer = createRendererStub();
    const loader = { load: vi.fn((url, onLoad) => onLoad?.({ scene: new THREE.Group() })) };
    const { unmount } = render(
      <SceneRoot rendererFactory={() => renderer} loaderFactory={() => loader} skipSupportCheck />,
    );

    expect(renderer.setPixelRatio).toHaveBeenCalled();
    expect(renderer.setSize).toHaveBeenCalledWith(640, 360, false);
    expect(renderer.domElement.parentElement).not.toBeNull();
    expect(loader.load).toHaveBeenCalled();

    unmount();

    expect(renderer.dispose).toHaveBeenCalled();
  });

  it('shows model fallback text when GLTF load fails', () => {
    const renderer = createRendererStub();
    const loader = { load: vi.fn((url, _onLoad, _onProgress, onError) => onError?.(new Error('fail'))) };
    render(
      <SceneRoot
        rendererFactory={() => renderer}
        loaderFactory={() => loader}
        skipSupportCheck
        loadScene
      />,
    );
    expect(screen.getByText(/scene model unavailable/i)).toBeInTheDocument();
  });

  it('disables shadows for low quality', () => {
    const renderer = createRendererStub();
    render(<SceneRoot rendererFactory={() => renderer} skipSupportCheck loadScene={false} quality="low" />);
    expect(renderer.shadowMap.enabled).toBe(false);
  });

  it('disables shadows when enableShadows is false', () => {
    const renderer = createRendererStub();
    render(
      <SceneRoot
        rendererFactory={() => renderer}
        skipSupportCheck
        loadScene={false}
        quality="high"
        enableShadows={false}
      />,
    );
    expect(renderer.shadowMap.enabled).toBe(false);
  });

  it('invokes profile selection when an NPC is clicked', () => {
    const renderer = createRendererStub();
    const raycaster = {
      setFromCamera: vi.fn(),
      intersectObjects: vi.fn(() => [{ object: { userData: { npcIndex: 0 } } }]),
    } as unknown as THREE.Raycaster;
    const handleSelect = vi.fn();

    vi.spyOn(renderer.domElement, 'getBoundingClientRect').mockReturnValue({
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      bottom: 100,
      right: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);

    render(
      <SceneRoot
        rendererFactory={() => renderer}
        skipSupportCheck
        loadScene={false}
        raycasterFactory={() => raycaster}
        onSelectProfile={handleSelect}
      />,
    );

    const event = typeof PointerEvent !== 'undefined'
      ? new PointerEvent('pointerup', { clientX: 10, clientY: 10 })
      : new MouseEvent('pointerup', { clientX: 10, clientY: 10 });
    renderer.domElement.dispatchEvent(event as Event);

    expect(handleSelect).toHaveBeenCalled();
  });

  it('invokes profile selection when the player is clicked', () => {
    const renderer = createRendererStub();
    const playerProfile = {
      id: 'player',
      displayName: 'You',
      avatarPreset: 'aurora',
      sharedInterests: ['mixology'],
      region: 'Local',
      affinityScore: 100,
    };
    const playerObject = new THREE.Object3D();
    playerObject.userData.isPlayer = true;
    const raycaster = {
      setFromCamera: vi.fn(),
      intersectObjects: vi.fn(() => [{ object: playerObject }]),
    } as unknown as THREE.Raycaster;
    const handleSelect = vi.fn();

    vi.spyOn(renderer.domElement, 'getBoundingClientRect').mockReturnValue({
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      bottom: 100,
      right: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);

    render(
      <SceneRoot
        rendererFactory={() => renderer}
        skipSupportCheck
        loadScene={false}
        raycasterFactory={() => raycaster}
        onSelectProfile={handleSelect}
        playerProfile={playerProfile}
      />,
    );

    const event = typeof PointerEvent !== 'undefined'
      ? new PointerEvent('pointerup', { clientX: 10, clientY: 10 })
      : new MouseEvent('pointerup', { clientX: 10, clientY: 10 });
    renderer.domElement.dispatchEvent(event as Event);

    expect(handleSelect).toHaveBeenCalledWith(playerProfile);
  });

  it('sends realtime transform when the player moves', () => {
    let loop: ((time: number) => void) | undefined;
    const renderer = {
      ...createRendererStub(),
      setAnimationLoop: vi.fn((cb: ((time: number) => void) | null) => {
        loop = cb ?? undefined;
      }),
    } as RendererStub;
    const sendTransform = vi.fn().mockResolvedValue(undefined);
    const mobileMoveRef = { current: { x: 1, z: 0 } } as unknown as MutableRefObject<{ x: number; z: number }>;

    render(
      <SceneRoot
        rendererFactory={() => renderer}
        skipSupportCheck
        loadScene={false}
        roomId="test-room"
        selfUserId="me"
        sendTransform={sendTransform}
        mobileMoveRef={mobileMoveRef}
      />,
    );

    expect(renderer.setAnimationLoop).toHaveBeenCalled();
    loop?.(0);
    loop?.(120);

    expect(sendTransform).toHaveBeenCalled();
  });
});
