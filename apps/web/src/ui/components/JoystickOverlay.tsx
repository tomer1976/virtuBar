type JoystickOverlayProps = {
  visible: boolean;
  invertYAxis?: boolean;
};

function JoystickOverlay({ visible, invertYAxis = false }: JoystickOverlayProps) {
  if (!visible) return null;

  return (
    <div
      className="panel"
      aria-label="Mobile controls HUD"
      style={{ display: 'grid', gap: '12px', position: 'relative' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0 }}>Mobile Controls</h3>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Non-functional joystick and action pads for mock demo.
          </p>
        </div>
        {invertYAxis ? <span className="badge">Invert Y</span> : null}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'grid', gap: '8px' }} aria-label="Move pad">
          <div style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Move</div>
          <div
            style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, #cbd5e1, #e2e8f0)',
              border: '1px solid var(--color-border)',
              display: 'grid',
              placeItems: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#fff',
                border: '1px solid var(--color-border)',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gap: '8px' }} aria-label="Look pad">
          <div style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Look</div>
          <div
            style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 70% 70%, #cbd5e1, #e2e8f0)',
              border: '1px solid var(--color-border)',
              display: 'grid',
              placeItems: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#fff',
                border: '1px solid var(--color-border)',
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }} aria-label="Primary actions">
        <span className="badge">Jump</span>
        <span className="badge">Interact</span>
        <span className="badge">Push-to-talk</span>
        <span className="badge">Menu</span>
      </div>
    </div>
  );
}

export default JoystickOverlay;
