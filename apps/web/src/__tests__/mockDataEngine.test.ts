import { DEFAULT_MOCK_SEED, generateMockData } from '../state/mockDataEngine';

describe('mockDataEngine', () => {
  it('generates rooms and users within expected ranges and deterministically per seed', () => {
    const first = generateMockData({ seed: DEFAULT_MOCK_SEED });
    const second = generateMockData({ seed: DEFAULT_MOCK_SEED });

    expect(first.rooms.length).toBeGreaterThanOrEqual(5);
    expect(first.rooms.length).toBeLessThanOrEqual(15);
    expect(first.users.length).toBeGreaterThanOrEqual(20);
    expect(first.users.length).toBeLessThanOrEqual(60);

    expect(first.rooms).toEqual(second.rooms);
    expect(first.users).toEqual(second.users);

    const totalOccupants = first.rooms.reduce((sum, room) => sum + room.occupants, 0);
    expect(totalOccupants).toBe(first.users.length);
  });

  it('changes output when seed changes', () => {
    const first = generateMockData({ seed: 'seed-a' });
    const second = generateMockData({ seed: 'seed-b' });

    expect(first.rooms[0].id).not.toBe(second.rooms[0].id);
    expect(first.users[0].id).not.toBe(second.users[0].id);
  });
});
