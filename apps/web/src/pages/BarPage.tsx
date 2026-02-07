import { useParams } from 'react-router-dom';
import { useSettings } from '../app/providers/SettingsProvider';
import { useFeatureFlags } from '../app/providers/FeatureFlagsProvider';
import ChatPanel from '../ui/components/ChatPanel';
import JoystickOverlay from '../ui/components/JoystickOverlay';
import NearbyPanel from '../ui/components/NearbyPanel';
import SceneRoot from '../three/SceneRoot';

function BarPage() {
  const { roomId } = useParams();
  const { settings } = useSettings();
  const flags = useFeatureFlags();

  return (
    <section className="page-card">
      <h2 className="page-title">Enter Bar</h2>
      <p className="page-subtitle">3D scene prototype with mock realtime + voice placeholders.</p>
      <div className="route-grid">
        <div className="route-chip">Room ID: {roomId ?? 'unknown'}</div>
        <div className="route-chip">Local 3D renderer</div>
        <div className="route-chip">Voice toggle (mock)</div>
      </div>

      <div className="scene-shell" aria-label="Bar 3D viewport">
        <SceneRoot />
      </div>

      <div
        style={{
          marginTop: '16px',
          display: 'grid',
          gap: '16px',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        }}
      >
        <ChatPanel seed={roomId ?? undefined} enableLiveness={flags.USE_MOCK_LIVENESS} />
        <NearbyPanel seed={roomId ?? undefined} />
        <JoystickOverlay visible={settings.showJoystick} invertYAxis={settings.invertYAxis} />
      </div>
    </section>
  );
}

export default BarPage;
