import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSettings } from '../app/providers/SettingsProvider';
import { useFeatureFlags } from '../app/providers/FeatureFlagsProvider';
import { useProfile } from '../app/providers/ProfileProvider';
import { useRealtimeIdentity } from '../app/providers/RealtimeIdentityProvider';
import { useRealtimeClient } from '../app/providers/RealtimeClientProvider';
import { RealtimeRoomProvider, useRealtimeRoom } from '../app/providers/RealtimeRoomProvider';
import ChatPanel from '../ui/components/ChatPanel';
import JoystickOverlay from '../ui/components/JoystickOverlay';
import NearbyPanel from '../ui/components/NearbyPanel';
import SceneRoot from '../three/SceneRoot';
import { ProfileCardOverlay } from '../ui/components';
import { generateNearbyUsers } from '../state/mockNearby';
import { routePaths } from '../routes';

function BarPage() {
  const { roomId } = useParams();
  const resolvedRoomId = roomId ?? 'lobby-room';
  return (
    <RealtimeRoomProvider roomId={resolvedRoomId}>
      <BarExperience roomId={resolvedRoomId} />
    </RealtimeRoomProvider>
  );
}

function BarExperience({ roomId }: { roomId: string }) {
  const mobileMoveRef = useRef<{ x: number; z: number }>({ x: 0, z: 0 });
  const mobileLookDeltaRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });
  const sceneShellRef = useRef<HTMLDivElement | null>(null);
  const { settings } = useSettings();
  const flags = useFeatureFlags();
  const { profile } = useProfile();
  const { identity } = useRealtimeIdentity();
  const { provider } = useRealtimeClient();
  const { members, sendTransform } = useRealtimeRoom();
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [activeFlyout, setActiveFlyout] = useState<'nearby' | 'controls' | null>(null);
  const [immersive, setImmersive] = useState(false);
  const [showSceneChat, setShowSceneChat] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerNearbyProfile = useMemo(() => ({
    id: 'player',
    displayName: profile.displayName || 'You',
    avatarPreset: profile.avatarPreset,
    sharedInterests: profile.interests.slice(0, 3),
    region: 'Local',
    affinityScore: 100,
  }), [profile.avatarPreset, profile.displayName, profile.interests]);
  const nearbyProfiles = useMemo(
    () => [playerNearbyProfile, ...generateNearbyUsers({ seed: roomId, count: 22 })],
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

  const openFlyout = useCallback((panel: 'nearby' | 'controls') => {
    setActiveFlyout((prev) => (prev === panel ? null : panel));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const mq = window.matchMedia('(max-width: 960px)');
    if (mq.matches) {
      setImmersive(true);
    }
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setImmersive(true);
      }
    };
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    const target = sceneShellRef.current ?? document.documentElement;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
      return;
    }
    target?.requestFullscreen?.().catch((error) => {
      console.warn('Fullscreen request failed', error);
    });
  }, []);

  return (
      <section className="page-card">
      <h2 className="page-title">Enter Bar</h2>
      <p className="page-subtitle">3D scene prototype with mock realtime + voice placeholders.</p>
      {!immersive ? (
        <div className="bar-quick-nav" aria-label="Quick navigation">
          <Link to={routePaths.landing} className="btn btn-ghost btn-compact">Landing</Link>
          <Link to={routePaths.login} className="btn btn-ghost btn-compact">Login</Link>
          <Link to={routePaths.onboarding} className="btn btn-ghost btn-compact">Onboarding</Link>
          <Link to={routePaths.rooms} className="btn btn-ghost btn-compact">Rooms</Link>
        </div>
      ) : null}

      {!immersive ? (
        <div className="route-grid">
          <div className="route-chip">Room ID: {roomId}</div>
          <div className="route-chip">Local 3D renderer</div>
          <div className="route-chip">Voice toggle (mock)</div>
        </div>
      ) : null}

      <div className={`bar-layout${immersive ? ' bar-layout-immersive' : ''}`}>
        <div className="bar-stage">
          <div className="bar-stage-header">
            <div className="route-chip" aria-label="Room status">Room: {roomId}</div>
            <div className="bar-stage-actions">
              <button type="button" className="btn btn-ghost btn-compact" onClick={() => setShowSceneChat((v) => !v)}>
                {showSceneChat ? 'Hide chat' : 'Chat'}
              </button>
              <button type="button" className="btn btn-ghost btn-compact" onClick={() => openFlyout('nearby')}>
                Nearby
              </button>
              <button type="button" className="btn btn-ghost btn-compact" onClick={() => openFlyout('controls')}>
                Controls
              </button>
              <button type="button" className="btn btn-ghost btn-compact" onClick={() => setImmersive((v) => !v)}>
                {immersive ? 'Exit full view' : 'Full view'}
              </button>
              <button type="button" className="btn btn-ghost btn-compact" onClick={handleToggleFullscreen}>
                {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              </button>
            </div>
          </div>

          <div className="scene-shell" aria-label="Bar 3D viewport" ref={sceneShellRef}>
            <SceneRoot
              quality={settings.graphicsQuality}
              enableShadows={!settings.lowGraphicsMode}
              loadScene={flags.USE_MOCK_3D_SCENE}
              enableNpcCrowdSim={flags.ENABLE_NPC_CROWD_SIM}
              mobileMoveRef={mobileMoveRef}
              mobileLookDeltaRef={mobileLookDeltaRef}
              profileSeed={roomId}
              playerProfile={playerNearbyProfile}
              onSelectProfile={(profile) => handleSelectProfile(profile.id)}
              roomId={roomId}
              selfUserId={identity.userId}
              roomMembers={members}
              realtimeProvider={provider}
              sendTransform={sendTransform}
            />
            {showSceneChat ? (
              <div className="scene-chat-overlay" role="dialog" aria-label="Chat overlay">
                <RealtimeHudChat selfUserId={identity.userId} enableLiveness={flags.USE_MOCK_LIVENESS} />
              </div>
            ) : null}
            {settings.showJoystick ? (
              <div className="floating-joystick" aria-label="Floating mobile controls">
                <JoystickOverlay
                  visible
                  variant="compact"
                  invertYAxis={settings.invertYAxis}
                  onMove={handleMove}
                  onMoveEnd={handleMoveEnd}
                  onLookDelta={handleLookDelta}
                />
              </div>
            ) : null}
          </div>
        </div>

        {!immersive ? (
          <aside className="side-dock" aria-label="HUD panels">
            <RealtimeHudChat selfUserId={identity.userId} enableLiveness={flags.USE_MOCK_LIVENESS} />
            <RealtimeHudNearby selfUserId={identity.userId} />
          </aside>
        ) : null}
      </div>

      {activeFlyout ? (
        <div className="bar-flyout" role="dialog" aria-label="Mobile HUD">
          <div className="bar-flyout-header">
            <span>{activeFlyout === 'nearby' ? 'Nearby' : 'Controls'}</span>
            <button className="btn btn-ghost btn-compact" type="button" onClick={() => setActiveFlyout(null)}>
              Close
            </button>
          </div>
          {activeFlyout === 'nearby' ? <NearbyPanel seed={roomId} /> : null}
          {activeFlyout === 'controls' ? (
            <JoystickOverlay
              visible
              invertYAxis={settings.invertYAxis}
              onMove={handleMove}
              onMoveEnd={handleMoveEnd}
              onLookDelta={handleLookDelta}
            />
          ) : null}
        </div>
      ) : null}

      <ProfileCardOverlay
        open={Boolean(selectedProfile)}
        user={selectedProfile}
        onClose={() => setSelectedProfileId(null)}
      />
      </section>
  );
}

function RealtimeHudChat({ selfUserId, enableLiveness }: { selfUserId: string; enableLiveness: boolean }) {
  const { chats, sendChat } = useRealtimeRoom();
  return (
    <ChatPanel
      enableLiveness={enableLiveness}
      realtimeMessages={chats.map((c) => ({
        id: c.id,
        author: c.author,
        content: c.content,
        timestamp: c.timestamp,
        fromSelf: c.fromSelf,
      }))}
      onSendRealtime={sendChat}
      selfUserId={selfUserId}
      initialCount={0}
    />
  );
}

function RealtimeHudNearby({ selfUserId }: { selfUserId: string }) {
  const { members } = useRealtimeRoom();
  return <NearbyPanel realtimeMembers={members} selfUserId={selfUserId} />;
}

export default BarPage;
