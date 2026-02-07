import { useEffect, useMemo, useRef, useState } from 'react';
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
  const rngRef = useRef<() => number>();

  useEffect(() => {
    setRooms(initialRooms);
  }, [initialRooms]);

  useEffect(() => {
    rngRef.current = createSeededRng(`${resolvedSeed}-drift`);
  }, [resolvedSeed]);

  useEffect(() => {
    if (!enableDrift) return undefined;
    const id = window.setInterval(() => {
      setRooms((prev) => driftRoomsOccupancy(prev, rngRef.current ?? createSeededRng(`${resolvedSeed}-drift`)));
    }, driftMs);
    return () => window.clearInterval(id);
  }, [driftMs, enableDrift, resolvedSeed]);

  const filteredRooms = useMemo(() => filterRoomsByTheme(rooms, filter), [filter, rooms]);
  const hottestRoom = useMemo(
    () => getHottestRoom(filteredRooms.length ? filteredRooms : rooms),
    [filteredRooms, rooms],
  );

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
      </div>

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

      <div style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <a className="btn btn-primary" href={`/bar/${hottestRoom.id}`}>
          Join hottest room ({hottestRoom.name}) — {hottestRoom.occupants} online
        </a>
        <span className="page-subtitle" style={{ margin: 0 }} aria-live="polite">
          Showing: {filterLabel}
        </span>
      </div>
    </section>
  );
}

export default RoomsPage;
