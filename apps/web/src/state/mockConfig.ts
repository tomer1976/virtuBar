import { DEFAULT_MOCK_SEED } from './mockDataEngine';

export type MockEngineConfig = {
  seed: string;
  rooms: {
    driftMs: number;
    minRooms: number;
    maxRooms: number;
  };
  nearby: {
    count: number;
    tickMs: number;
  };
  chat: {
    initialCount: number;
    tickMs: number;
    maxMessages: number;
  };
};

export const mockEngineConfig: MockEngineConfig = {
  seed: DEFAULT_MOCK_SEED,
  rooms: {
    driftMs: 4000,
    minRooms: 5,
    maxRooms: 15,
  },
  nearby: {
    count: 8,
    tickMs: 3500,
  },
  chat: {
    initialCount: 6,
    tickMs: 5000,
    maxMessages: 30,
  },
};

export function applyMockSeed<T extends { seed?: string | number }>(options: T): T {
  return { seed: mockEngineConfig.seed, ...options };
}