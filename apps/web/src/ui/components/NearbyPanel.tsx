import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '.';
import {
  driftNearbyUsers,
  generateNearbyUsers,
  NearbyOptions,
  sortNearby,
} from '../../state/mockNearby';
import { createSeededRng } from '../../state/mockDataEngine';

type NearbyPanelProps = NearbyOptions & {
  tickMs?: number;
};

function NearbyPanel({ seed, count = 8, tickMs = 3500 }: NearbyPanelProps) {
  const initial = useMemo(() => sortNearby(generateNearbyUsers({ seed, count })), [seed, count]);
  const [nearby, setNearby] = useState(initial);
  const rngRef = useRef<() => number>();

  useEffect(() => {
    setNearby(initial);
  }, [initial]);

  useEffect(() => {
    rngRef.current = createSeededRng(`${seed ?? 'nearby'}-drift`);
  }, [seed]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setNearby((prev) => sortNearby(driftNearbyUsers(prev, rngRef.current ?? (() => Math.random()))));
    }, tickMs);
    return () => window.clearInterval(id);
  }, [tickMs]);

  return (
    <div className="panel" aria-label="Nearby users" style={{ display: 'grid', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0 }}>Nearby</h3>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Grouped by region; sorted by shared interests (mock liveness).
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => setNearby(sortNearby(generateNearbyUsers({ seed, count })))}
          type="button"
        >
          Refresh list
        </Button>
      </div>
      <div className="route-grid" aria-label="Nearby list">
        {nearby.map((user, idx) => (
          <div key={user.id} className="route-chip" data-testid={`nearby-${idx}`} style={{ textAlign: 'left' }}>
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
              <span aria-label={`Shared interests with ${user.displayName}`}>
                {user.sharedInterests.length} shared interests
              </span>
              <span className="badge" aria-label={`Activity score for ${user.displayName}`}>
                Activity {user.affinityScore}
              </span>
              <span className="badge" aria-label="Rank">
                #{idx + 1}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NearbyPanel;
