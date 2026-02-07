import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

type JoystickOverlayProps = {
  visible: boolean;
  invertYAxis?: boolean;
  onMove?: (vector: { x: number; z: number }) => void;
  onMoveEnd?: () => void;
  onLookDelta?: (delta: { dx: number; dy: number }) => void;
  variant?: 'full' | 'compact';
};

function JoystickOverlay({ visible, invertYAxis = false, onMove, onMoveEnd, onLookDelta, variant = 'full' }: JoystickOverlayProps) {
  const movePadRef = useRef<HTMLDivElement | null>(null);
  const lookPadRef = useRef<HTMLDivElement | null>(null);
  const lookLastRef = useRef<{ x: number; y: number } | null>(null);
  const [moveActive, setMoveActive] = useState(false);
  const [lookActive, setLookActive] = useState(false);

  const padSize = useMemo(() => (
    variant === 'compact'
      ? { size: 96, knob: 44 }
      : { size: 140, knob: 60 }
  ), [variant]);

  if (!visible) return null;

  const getPadRect = (pad: HTMLDivElement | null) => {
    if (!pad) return null;
    const rect = pad.getBoundingClientRect();
    return { rect, cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2, radius: rect.width / 2 };
  };

  const clampPadVector = (dx: number, dy: number, radius: number) => {
    const limitedX = Math.min(Math.max(dx, -radius), radius);
    const limitedY = Math.min(Math.max(dy, -radius), radius);
    return { x: limitedX / radius, z: -limitedY / radius };
  };

  const updateMoveFromEvent = (event: ReactPointerEvent<HTMLDivElement>) => {
    const pad = movePadRef.current;
    const info = getPadRect(pad);
    if (!info) return;
    const clientX = event.clientX ?? info.cx;
    const clientY = event.clientY ?? info.cy;
    const dx = clientX - info.cx;
    const dy = clientY - info.cy;
    const vector = clampPadVector(dx, dy, info.radius);
    onMove?.(vector);
  };

  const handleMovePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    setMoveActive(true);
    movePadRef.current?.setPointerCapture?.(event.pointerId);
    updateMoveFromEvent(event);
  };

  const handleMovePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!moveActive) return;
    updateMoveFromEvent(event);
  };

  const resetMove = () => {
    setMoveActive(false);
    onMoveEnd?.();
  };

  const handleMovePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    movePadRef.current?.releasePointerCapture?.(event.pointerId);
    resetMove();
  };

  const handleLookPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    setLookActive(true);
    lookPadRef.current?.setPointerCapture?.(event.pointerId);
    lookLastRef.current = { x: event.clientX, y: event.clientY };
  };

  const handleLookPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!lookActive || !lookLastRef.current) return;
    const prev = lookLastRef.current;
    const clientX = event.clientX ?? prev.x;
    const clientY = event.clientY ?? prev.y;
    const dxRaw = clientX - prev.x;
    const dyRaw = clientY - prev.y;
    const dx = Number.isFinite(dxRaw) ? dxRaw : 0;
    const dy = Number.isFinite(dyRaw) ? dyRaw : 0;
    lookLastRef.current = { x: clientX, y: clientY };
    onLookDelta?.({ dx, dy: invertYAxis ? -dy : dy });
  };

  const handleLookPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    lookPadRef.current?.releasePointerCapture?.(event.pointerId);
    setLookActive(false);
    lookLastRef.current = null;
  };

  const content = (
    <>
      {variant === 'full' ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0 }}>Mobile Controls</h3>
            <p className="page-subtitle" style={{ margin: 0 }}>
              Drag to move/look. Action badges are placeholders.
            </p>
          </div>
          {invertYAxis ? <span className="badge">Invert Y</span> : null}
        </div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: variant === 'compact' ? '8px' : '16px',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'grid', gap: '8px' }}>
          {variant === 'full' ? <div style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Move</div> : null}
          <div
            ref={movePadRef}
            aria-label="Move pad"
            onPointerDown={handleMovePointerDown}
            onPointerMove={handleMovePointerMove}
            onPointerUp={handleMovePointerUp}
            onPointerCancel={resetMove}
            onPointerLeave={resetMove}
            style={{
              width: `${padSize.size}px`,
              height: `${padSize.size}px`,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #cbd5e1, #e2e8f0)',
              border: '1px solid var(--color-border)',
              display: 'grid',
              placeItems: 'center',
              boxShadow: 'var(--shadow-sm)',
              touchAction: 'none',
            }}
          >
            <div
              style={{
                width: `${padSize.knob}px`,
                height: `${padSize.knob}px`,
                borderRadius: '50%',
                background: '#fff',
                border: '1px solid var(--color-border)',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gap: '8px' }}>
          {variant === 'full' ? <div style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Look</div> : null}
          <div
            ref={lookPadRef}
            aria-label="Look pad"
            onPointerDown={handleLookPointerDown}
            onPointerMove={handleLookPointerMove}
            onPointerUp={handleLookPointerUp}
            onPointerCancel={handleLookPointerUp}
            onPointerLeave={handleLookPointerUp}
            style={{
              width: `${padSize.size}px`,
              height: `${padSize.size}px`,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 70% 70%, #cbd5e1, #e2e8f0)',
              border: '1px solid var(--color-border)',
              display: 'grid',
              placeItems: 'center',
              boxShadow: 'var(--shadow-sm)',
              touchAction: 'none',
            }}
          >
            <div
              style={{
                width: `${padSize.knob}px`,
                height: `${padSize.knob}px`,
                borderRadius: '50%',
                background: '#fff',
                border: '1px solid var(--color-border)',
              }}
            />
          </div>
        </div>
      </div>

      {variant === 'full' ? (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }} aria-label="Primary actions">
          <span className="badge">Jump</span>
          <span className="badge">Interact</span>
          <span className="badge">Push-to-talk</span>
          <span className="badge">Menu</span>
        </div>
      ) : null}
    </>
  );

  if (variant === 'compact') {
    return (
      <div
        aria-label="Mobile controls HUD"
        style={{
          display: 'grid',
          gap: '8px',
          padding: '8px 10px',
          borderRadius: '12px',
          background: 'rgba(15,23,42,0.65)',
          border: '1px solid rgba(226,232,240,0.25)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className="panel"
      aria-label="Mobile controls HUD"
      style={{ display: 'grid', gap: '12px', position: 'relative' }}
    >
      {content}
    </div>
  );
}

export default JoystickOverlay;
