import { RoomFilter, RoomTheme, MockRoom } from './mockRooms';

export type MockUser = {
  id: string;
  displayName: string;
  avatarPreset: string;
  interests: string[];
  homeRoomId: string;
};

export type MockDataResult = {
  rooms: MockRoom[];
  users: MockUser[];
};

export type MockDataOptions = {
  seed?: string | number;
  minRooms?: number;
  maxRooms?: number;
  minUsers?: number;
  maxUsers?: number;
};

export const DEFAULT_MOCK_SEED = 'virtubar-phase1-mock';

const roomThemes: RoomTheme[] = ['dj', 'karaoke', 'chill', 'cocktails', 'lounge'];
const avatarPresets = ['aurora', 'midnight', 'neon', 'sunset', 'ember', 'prism'];
const interestOptions = ['Music', 'Karaoke', 'VR', 'Cocktails', 'Live DJ', 'Chill', 'Dancing', 'Trivia'];
const roomAdjectives = ['Neon', 'Aurora', 'Velvet', 'Midnight', 'Prism', 'Echo', 'Ember'];
const roomNouns = ['Lounge', 'Atrium', 'Booth', 'Terrace', 'Hideout', 'Stage'];
const topicByTheme: Record<RoomTheme, string[]> = {
  dj: ['Peak-hour DJ set', 'Guest DJ cameo', 'House & techno blend'],
  karaoke: ['Karaoke queue', 'Duet hour', 'Throwback karaoke'],
  chill: ['Chill synthwave', 'Lo-fi lounge', 'Ambient corner'],
  cocktails: ['Cocktail tastings', 'Signature drinks', 'Mixology hour'],
  lounge: ['Low-fi lounge', 'Cozy meetups', 'Quiet conversations'],
};
const userFirstNames = ['Nova', 'Riley', 'Jordan', 'Sage', 'Alex', 'Kai', 'Morgan', 'Skye'];
const userLastNames = ['Blaze', 'Ray', 'Hart', 'Vale', 'Wilde', 'Stone', 'Echo', 'Storm'];

function hashSeed(seed: string | number): number {
  if (typeof seed === 'number') return seed >>> 0;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash >>> 0;
}

function createRng(seed: string | number): () => number {
  const m = 2 ** 32;
  const a = 1664525;
  const c = 1013904223;
  let state = hashSeed(seed) || 1;
  return () => {
    state = (a * state + c) % m;
    return state / m;
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function pick<T>(items: T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)];
}

function buildRoomName(rng: () => number): string {
  return `${pick(roomAdjectives, rng)} ${pick(roomNouns, rng)}`;
}

function sampleInterests(rng: () => number): string[] {
  const count = clamp(Math.floor(rng() * 3) + 2, 2, 4);
  const pool = [...interestOptions];
  const interests: string[] = [];
  for (let i = 0; i < count && pool.length; i += 1) {
    const idx = Math.floor(rng() * pool.length);
    interests.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return interests;
}

function generateRooms(rng: () => number, count: number): MockRoom[] {
  const rooms: MockRoom[] = [];
  for (let i = 0; i < count; i += 1) {
    const theme = pick(roomThemes, rng);
    rooms.push({
      id: `room-${theme}-${i}`,
      name: buildRoomName(rng),
      topic: pick(topicByTheme[theme], rng),
      occupants: 0,
      theme,
    });
  }
  return rooms;
}

function generateUsers(
  rng: () => number,
  rooms: MockRoom[],
  totalUsers: number,
): { users: MockUser[]; roomOccupants: number[] } {
  const roomOccupants = new Array(rooms.length).fill(0);
  const users: MockUser[] = [];

  const baseUsers = Math.min(totalUsers, rooms.length);
  for (let i = 0; i < baseUsers; i += 1) {
    const roomIndex = i % rooms.length;
    users.push(buildUser(rng, rooms[roomIndex].id, i));
    roomOccupants[roomIndex] += 1;
  }

  for (let i = baseUsers; i < totalUsers; i += 1) {
    const roomIndex = Math.floor(rng() * rooms.length);
    users.push(buildUser(rng, rooms[roomIndex].id, i));
    roomOccupants[roomIndex] += 1;
  }

  return { users, roomOccupants };
}

function buildUser(rng: () => number, roomId: string, index: number): MockUser {
  return {
    id: `user-${index}-${Math.floor(rng() * 1_000_000)}`,
    displayName: `${pick(userFirstNames, rng)} ${pick(userLastNames, rng)}`,
    avatarPreset: pick(avatarPresets, rng),
    interests: sampleInterests(rng),
    homeRoomId: roomId,
  };
}

export function generateMockData(options: MockDataOptions = {}): MockDataResult {
  const rng = createRng(options.seed ?? DEFAULT_MOCK_SEED);
  const roomCount = clamp(
    Math.floor(rng() * ((options.maxRooms ?? 15) - (options.minRooms ?? 5) + 1)) + (options.minRooms ?? 5),
    options.minRooms ?? 5,
    options.maxRooms ?? 15,
  );

  const userCount = clamp(
    Math.floor(rng() * ((options.maxUsers ?? 60) - (options.minUsers ?? 20) + 1)) + (options.minUsers ?? 20),
    options.minUsers ?? 20,
    options.maxUsers ?? 60,
  );

  const rooms = generateRooms(rng, roomCount);
  const { users, roomOccupants } = generateUsers(rng, rooms, userCount);
  const hydratedRooms = rooms.map((room, index) => ({ ...room, occupants: roomOccupants[index] }));

  return { rooms: hydratedRooms, users };
}

export function describeFilter(filter: RoomFilter): string {
  switch (filter) {
    case 'dj':
      return 'Live DJ';
    case 'karaoke':
      return 'Karaoke';
    case 'chill':
      return 'Chill';
    case 'cocktails':
      return 'Cocktails';
    case 'lounge':
      return 'Lounge';
    default:
      return 'All themes';
  }
}
