const mockRooms = [
  { id: 'room-101', name: 'Neon Lounge', occupants: 23, topic: 'Live DJ set' },
  { id: 'room-202', name: 'Aurora Atrium', occupants: 18, topic: 'Chill vibes' },
  { id: 'room-303', name: 'Midnight Booth', occupants: 12, topic: 'Karaoke queue' },
];

function RoomsPage() {
  const hottestRoom = mockRooms.reduce((top, room) => (room.occupants > top.occupants ? room : top), mockRooms[0]);

  return (
    <section className="page-card">
      <h2 className="page-title">Rooms</h2>
      <p className="page-subtitle">Mock rooms directory with CTA to join hottest room.</p>

      <div className="route-grid" aria-label="Room list">
        {mockRooms.map((room) => (
          <div key={room.id} className="route-chip">
            <div style={{ fontWeight: 600 }}>{room.name}</div>
            <div style={{ color: 'var(--color-text-muted)' }}>{room.topic}</div>
            <div>{room.occupants} online</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <a className="btn btn-primary" href={`/bar/${hottestRoom.id}`}>
          Join hottest room ({hottestRoom.name})
        </a>
        <span className="page-subtitle" style={{ margin: 0 }}>
          Deterministic mock data; no realtime required.
        </span>
      </div>
    </section>
  );
}

export default RoomsPage;
