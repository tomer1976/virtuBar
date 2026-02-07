export type RoomTheme = 'dj' | 'karaoke' | 'chill' | 'cocktails' | 'lounge';

export type MockRoom = {
  id: string;
  name: string;
  occupants: number;
  topic: string;
  theme: RoomTheme;
};

export type RoomFilter = 'all' | RoomTheme;

export const mockRoomFilters: { value: RoomFilter; label: string }[] = [
  { value: 'all', label: 'All themes' },
  { value: 'dj', label: 'Live DJ' },
  { value: 'karaoke', label: 'Karaoke' },
  { value: 'chill', label: 'Chill' },
  { value: 'cocktails', label: 'Cocktails' },
  { value: 'lounge', label: 'Lounge' },
];

export const mockRooms: MockRoom[] = [
  { id: 'room-neon', name: 'Neon Lounge', occupants: 52, topic: 'Peak-hour DJ set', theme: 'dj' },
  { id: 'room-aurora', name: 'Aurora Atrium', occupants: 34, topic: 'Chill synthwave', theme: 'chill' },
  { id: 'room-midnight', name: 'Midnight Booth', occupants: 21, topic: 'Karaoke queue', theme: 'karaoke' },
  { id: 'room-ember', name: 'Ember Terrace', occupants: 29, topic: 'Cocktail tastings', theme: 'cocktails' },
  { id: 'room-velvet', name: 'Velvet Hideout', occupants: 18, topic: 'Low-fi lounge', theme: 'lounge' },
  { id: 'room-prism', name: 'Prism Stage', occupants: 41, topic: 'Guest DJ cameo', theme: 'dj' },
];

export function filterRoomsByTheme(rooms: MockRoom[], filter: RoomFilter): MockRoom[] {
  if (filter === 'all') return rooms;
  return rooms.filter((room) => room.theme === filter);
}

export function getHottestRoom(rooms: MockRoom[]): MockRoom {
  return rooms.reduce((hottest, candidate) =>
    candidate.occupants > hottest.occupants ? candidate : hottest,
  );
}
