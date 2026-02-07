import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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
    const { unmount } = render(
      <SceneRoot rendererFactory={() => renderer} skipSupportCheck />,
    );

    expect(renderer.setPixelRatio).toHaveBeenCalled();
    expect(renderer.setSize).toHaveBeenCalledWith(640, 360, false);
    expect(renderer.domElement.parentElement).not.toBeNull();

    unmount();

    expect(renderer.dispose).toHaveBeenCalled();
  });

  it('shows fallback text when WebGL is unavailable', () => {
    render(<SceneRoot />);
    expect(screen.getByText(/3d preview unavailable/i)).toBeInTheDocument();
  });
});
