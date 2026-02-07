import { render, screen } from '@testing-library/react';
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
};

function createRendererStub(): RendererStub {
  return {
    domElement: document.createElement('canvas'),
    shadowMap: { enabled: false },
    setSize: vi.fn(),
    setPixelRatio: vi.fn(),
    render: vi.fn(),
    dispose: vi.fn(),
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
      />,
    );
    expect(screen.getByText(/scene model unavailable/i)).toBeInTheDocument();
  });
});
