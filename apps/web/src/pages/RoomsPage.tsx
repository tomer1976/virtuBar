import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createSeededRng,
  DEFAULT_MOCK_SEED,
  driftRoomsOccupancy,
  generateMockData,
} from '../state/mockDataEngine';
import {
  filterRoomsByTheme,
  getHottestRoom,
  mockRoomFilters,
  RoomFilter,
} from '../state/mockRooms';
import { Button } from '../ui/components';
import { useErrorNotifications } from '../app/providers/ErrorNotificationsProvider';
import { useFeatureFlags } from '../app/providers/FeatureFlagsProvider';

type RoomsPageProps = {
  seed?: string | number;
  driftMs?: number;
  enableDrift?: boolean;
};

function RoomsPage({ seed, driftMs = 4000, enableDrift = true }: RoomsPageProps) {
  const resolvedSeed = seed ?? DEFAULT_MOCK_SEED;
  const { rooms: initialRooms } = useMemo(() => generateMockData({ seed: resolvedSeed }), [resolvedSeed]);
  const [rooms, setRooms] = useState(initialRooms);
  const [filter, setFilter] = useState<RoomFilter>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const rngRef = useRef<() => number>();
  const { notifyError } = useErrorNotifications();
  const flags = useFeatureFlags();

  useEffect(() => {
    setRooms(initialRooms);
    setError(null);
    setLoading(false);
  }, [initialRooms]);

  useEffect(() => {
    rngRef.current = createSeededRng(`${resolvedSeed}-drift`);
  }, [resolvedSeed]);

  useEffect(() => {
    if (!enableDrift || !flags.USE_MOCK_LIVENESS) return undefined;
    const id = window.setInterval(() => {
      setRooms((prev) => driftRoomsOccupancy(prev, rngRef.current ?? createSeededRng(`${resolvedSeed}-drift`)));
    }, driftMs);
    return () => window.clearInterval(id);
  }, [driftMs, enableDrift, resolvedSeed, flags.USE_MOCK_LIVENESS]);

  const triggerLoad = useCallback(
    (mode: 'success' | 'failure') => {
      setLoading(true);
      setError(null);
      window.setTimeout(() => {
        if (mode === 'failure') {
          setRooms([]);
          setLoading(false);
          setError('Mock rooms failed to load.');
          notifyError('Mock rooms failed to load; retry to continue demo.');
          return;
        }
        const { rooms: next } = generateMockData({ seed: resolvedSeed });
        setRooms(next);
        setLoading(false);
      }, 250);
    },
    [notifyError, resolvedSeed],
  );

  const filteredRooms = useMemo(() => filterRoomsByTheme(rooms, filter), [filter, rooms]);
  const hottestRoom = useMemo(() => {
    const source = filteredRooms.length ? filteredRooms : rooms;
    if (!source.length) return null;
    return getHottestRoom(source);
  }, [filteredRooms, rooms]);

  const filterLabel = mockRoomFilters.find((option) => option.value === filter)?.label ?? 'All themes';

  return (
    <section className="page-card">
      <h2 className="page-title">Rooms</h2>
      <p className="page-subtitle">Filter by vibe, see occupancy, and hop into the hottest room.</p>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {mockRoomFilters.map((option) => {
          const active = option.value === filter;
          return (
            <Button
              key={option.value}
              variant={active ? 'primary' : 'ghost'}
              aria-pressed={active}
              onClick={() => setFilter(option.value)}
              type="button"
            >
              {option.label}
            </Button>
          );
        })}
        <Button variant="ghost" type="button" onClick={() => triggerLoad('success')}>
          Simulate load
        </Button>
        <Button variant="ghost" type="button" onClick={() => triggerLoad('failure')}>
          Simulate failure
        </Button>
      </div>

      {loading ? (
        <div className="route-chip" aria-live="polite" data-testid="rooms-loading">
          Loading rooms...
        </div>
      ) : error ? (
        <div className="route-chip" aria-live="assertive" data-testid="rooms-error" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span>{error}</span>
          <Button variant="ghost" type="button" onClick={() => triggerLoad('success')}>
            Retry
          </Button>
        </div>
      ) : (
        <>
          <div className="route-grid" aria-label="Room list">
            {filteredRooms.map((room) => (
              <div key={room.id} className="route-chip" style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600 }}>{room.name}</div>
                <div style={{ color: 'var(--color-text-muted)' }}>{room.topic}</div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span>{room.occupants} online</span>
                  <span className="badge" aria-label={`Theme ${room.theme}`}>
                    {room.theme}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredRooms.length === 0 && (
            <div className="route-chip" aria-live="polite" style={{ marginTop: '12px' }}>
              No rooms match this filter yet.
            </div>
          )}
        </>
      )}

      {hottestRoom ? (
        <div style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <a className="btn btn-primary" href={`/bar/${hottestRoom.id}`}>
            Join hottest room ({hottestRoom.name}) — {hottestRoom.occupants} online
          </a>
          <span className="page-subtitle" style={{ margin: 0 }} aria-live="polite">
            Showing: {filterLabel}
          </span>
        </div>
      ) : null}
    </section>
  );
}

export default RoomsPage;
