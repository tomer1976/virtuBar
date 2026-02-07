import { createSeededRng, DEFAULT_MOCK_SEED, generateMockData } from './mockDataEngine';

export type NearbyUser = {
  id: string;
  displayName: string;
  avatarPreset: string;
  sharedInterests: string[];
  region: string;
  affinityScore: number;
};

export type NearbyOptions = {
  seed?: string | number;
  count?: number;
};

function scoreAffinity(sharedInterests: string[], rng: () => number): number {
  return sharedInterests.length * 10 + Math.floor(rng() * 10);
}

export function generateNearbyUsers(options: NearbyOptions = {}): NearbyUser[] {
  const seed = options.seed ?? DEFAULT_MOCK_SEED;
  const count = options.count ?? 8;
  const rng = createSeededRng(`${seed}-nearby`);
  const { users } = generateMockData({ seed });
  const picked = users.slice(0, count);

  return picked.map((user) => {
    const sharedInterests = user.interests.slice(0, 3);
    return {
      id: user.id,
      displayName: user.displayName,
      avatarPreset: user.avatarPreset,
      sharedInterests,
      region: user.region ?? 'Global',
      affinityScore: scoreAffinity(sharedInterests, rng),
    };
  });
}

export function sortNearby(users: NearbyUser[]): NearbyUser[] {
  return [...users].sort((a, b) => {
    if (a.region !== b.region) return a.region.localeCompare(b.region);
    if (b.affinityScore !== a.affinityScore) return b.affinityScore - a.affinityScore;
    return a.displayName.localeCompare(b.displayName);
  });
}

export function driftNearbyUsers(users: NearbyUser[], rng: () => number): NearbyUser[] {
  return users.map((user) => {
    const updatedAffinity = user.affinityScore + Math.floor(rng() * 6) - 2; // small wobble
    return {
      ...user,
      affinityScore: Math.max(0, updatedAffinity),
    };
  });
}
