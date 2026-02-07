import { useCallback, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSettings } from '../app/providers/SettingsProvider';
import { useFeatureFlags } from '../app/providers/FeatureFlagsProvider';
import { useProfile } from '../app/providers/ProfileProvider';
import ChatPanel from '../ui/components/ChatPanel';
import JoystickOverlay from '../ui/components/JoystickOverlay';
import NearbyPanel from '../ui/components/NearbyPanel';
import SceneRoot from '../three/SceneRoot';
import { ProfileCardOverlay } from '../ui/components';
import { generateNearbyUsers } from '../state/mockNearby';

function BarPage() {
  const mobileMoveRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  const mobileLookDeltaRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const { roomId } = useParams();
  const { settings } = useSettings();
  const flags = useFeatureFlags();
  const { profile } = useProfile();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const playerNearbyProfile = useMemo(() => ({
    id: 'player',
    displayName: profile.displayName || 'You',
    avatarPreset: profile.avatarPreset,
    sharedInterests: profile.interests.slice(0, 3),
    region: 'Local',
    affinityScore: 100,
  }), [profile.avatarPreset, profile.displayName, profile.interests]);
  const nearbyProfiles = useMemo(
    () => [playerNearbyProfile, ...generateNearbyUsers({ seed: roomId ?? undefined, count: 22 })],
    [playerNearbyProfile, roomId],
  );

  const handleMove = useCallback((vector: { x: number; z: number }) => {
    mobileMoveRef.current.x = vector.x;
    mobileMoveRef.current.z = vector.z;
  }, []);

  const handleMoveEnd = useCallback(() => {
    mobileMoveRef.current.x = 0;
    mobileMoveRef.current.z = 0;
  }, []);

  const handleLookDelta = useCallback((delta: { dx: number; dy: number }) => {
    mobileLookDeltaRef.current.dx += delta.dx;
    mobileLookDeltaRef.current.dy += delta.dy;
  }, []);

  const selectedProfile = selectedProfileId
    ? nearbyProfiles.find((profile) => profile.id === selectedProfileId) ?? null
    : null;

  const handleSelectProfile = useCallback((profileId: string) => {
    setSelectedProfileId(profileId);
  }, []);

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
        <SceneRoot
          quality={settings.graphicsQuality}
          enableShadows={!settings.lowGraphicsMode}
          loadScene={flags.USE_MOCK_3D_SCENE}
          enableNpcCrowdSim={flags.ENABLE_NPC_CROWD_SIM}
          mobileMoveRef={mobileMoveRef}
          mobileLookDeltaRef={mobileLookDeltaRef}
          profileSeed={roomId ?? undefined}
          playerProfile={playerNearbyProfile}
          onSelectProfile={(profile) => handleSelectProfile(profile.id)}
        />
      </div>

      <ProfileCardOverlay
        open={Boolean(selectedProfile)}
        user={selectedProfile}
        onClose={() => setSelectedProfileId(null)}
      />

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
        <JoystickOverlay
          visible={settings.showJoystick}
          invertYAxis={settings.invertYAxis}
          onMove={handleMove}
          onMoveEnd={handleMoveEnd}
          onLookDelta={handleLookDelta}
        />
      </div>
    </section>
  );
}

export default BarPage;
