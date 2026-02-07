import { createSeededRng, DEFAULT_MOCK_SEED, generateMockData } from './mockDataEngine';

export type NearbyUser = {
  id: string;
  displayName: string;
  avatarPreset: string;
  sharedInterests: string[];
  x: number;
  y: number;
  distance: number;
};

export type NearbyOptions = {
  seed?: string | number;
  count?: number;
  maxRadius?: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function computeDistance(x: number, y: number) {
  return Math.sqrt(x * x + y * y);
}

export function generateNearbyUsers(options: NearbyOptions = {}): NearbyUser[] {
  const seed = options.seed ?? DEFAULT_MOCK_SEED;
  const count = options.count ?? 8;
  const maxRadius = options.maxRadius ?? 30;
  const rng = createSeededRng(`${seed}-nearby`);
  const { users } = generateMockData({ seed });
  const picked = users.slice(0, count);

  return picked.map((user, index) => {
    const x = rng() * maxRadius * (rng() > 0.5 ? 1 : -1);
    const y = rng() * maxRadius * (rng() > 0.5 ? 1 : -1);
    return {
      id: user.id,
      displayName: user.displayName,
      avatarPreset: user.avatarPreset,
      sharedInterests: user.interests.slice(0, 2),
      x,
      y,
      distance: computeDistance(x, y) + index * 0.01, // slight tie breaker for stability
    };
  });
}

export function sortNearby(users: NearbyUser[]): NearbyUser[] {
  return [...users].sort((a, b) => a.distance - b.distance);
}

export function driftNearbyUsers(
  users: NearbyUser[],
  rng: () => number,
  maxStep = 2.5,
  maxRadius = 35,
): NearbyUser[] {
  return users.map((user) => {
    const stepX = (rng() * 2 - 1) * maxStep;
    const stepY = (rng() * 2 - 1) * maxStep;
    const nextX = clamp(user.x + stepX, -maxRadius, maxRadius);
    const nextY = clamp(user.y + stepY, -maxRadius, maxRadius);
    return {
      ...user,
      x: nextX,
      y: nextY,
      distance: computeDistance(nextX, nextY),
    };
  });
}
