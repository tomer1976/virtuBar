import { useEffect, useMemo, useState } from 'react';
import { Button, ProfileCardOverlay } from '.';
import { generateNearbyUsers, NearbyOptions, sortNearby } from '../../state/mockNearby';
import { RoomMemberState } from '../../net/realtime/types';
import { mockEngineConfig } from '../../state/mockConfig';

type NearbyPanelProps = NearbyOptions & {
  realtimeMembers?: RoomMemberState[];
  selfUserId?: string;
};

function NearbyPanel({ seed, count = mockEngineConfig.nearby.count, realtimeMembers, selfUserId }: NearbyPanelProps) {
  const resolvedSeed = seed ?? mockEngineConfig.seed;
  const isRealtime = Boolean(realtimeMembers);

  const initial = useMemo(
    () => sortNearby(generateNearbyUsers({ seed: resolvedSeed, count })),
    [resolvedSeed, count],
  );
  const [nearby, setNearby] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mutedIds, setMutedIds] = useState<Set<string>>(new Set());
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isRealtime && realtimeMembers) {
      const mapped = realtimeMembers.map((member) => ({
        id: member.userId,
        displayName: member.displayName,
        avatarPreset: member.avatarId,
        sharedInterests: [],
        region: 'Room',
        affinityScore: 100,
      }));
      setNearby(sortNearby(mapped));
      return;
    }
    setNearby(initial);
    setSelectedId(null);
    setMutedIds(new Set());
    setBlockedIds(new Set());
    setReportedIds(new Set());
  }, [initial, isRealtime, realtimeMembers]);

  const displayedNearby = useMemo(
    () => nearby.filter((user) => !blockedIds.has(user.id)),
    [blockedIds, nearby],
  );

  const handleToggleMute = (id: string) => {
    setMutedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleBlock = (id: string) => {
    setBlockedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSelectedId((current) => (current === id ? null : current));
  };

  const handleToggleReport = (id: string) => {
    setReportedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="panel" aria-label="Nearby users" style={{ display: 'grid', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0 }}>Nearby</h3>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Grouped by region; sorted by shared interests.
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => setNearby(sortNearby(generateNearbyUsers({ seed: resolvedSeed, count })))}
          type="button"
        >
          Refresh list
        </Button>
      </div>
      <div className="route-grid" aria-label="Nearby list">
        {displayedNearby.map((user, idx) => (
          <button
            key={user.id}
            className="route-chip"
            data-testid={`nearby-${idx}`}
            style={{ textAlign: 'left', cursor: 'pointer' }}
            onClick={() => setSelectedId(user.id)}
            type="button"
            aria-label={`Open profile for ${user.displayName}`}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{user.displayName}</span>
              <span className="badge" aria-label={`Region ${user.region}`}>
                {user.region}
              </span>
            </div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>
              {user.sharedInterests.join(', ') || 'No shared interests yet'}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {user.sharedInterests.length ? (
                <span aria-label={`Shared interests with ${user.displayName}`}>
                  {user.sharedInterests.length} shared interests
                </span>
              ) : null}
              <span className="badge" aria-label={`Activity score for ${user.displayName}`}>
                Activity {user.affinityScore}
              </span>
              <span className="badge" aria-label="Rank">
                #{idx + 1}
              </span>
              {selfUserId === user.id ? <span className="badge">You</span> : null}
              {mutedIds.has(user.id) ? <span className="badge">Muted</span> : null}
              {reportedIds.has(user.id) ? <span className="badge">Reported</span> : null}
            </div>
          </button>
        ))}
      </div>

      <ProfileCardOverlay
        open={Boolean(selectedId)}
        user={nearby.find((item) => item.id === selectedId) ?? null}
        muted={selectedId ? mutedIds.has(selectedId) : false}
        blocked={selectedId ? blockedIds.has(selectedId) : false}
        reported={selectedId ? reportedIds.has(selectedId) : false}
        onToggleMute={handleToggleMute}
        onToggleBlock={handleToggleBlock}
        onToggleReport={handleToggleReport}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}

export default NearbyPanel;
