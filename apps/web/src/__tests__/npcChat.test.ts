import { describe, expect, it } from 'vitest';
import { createNpcChatState, stepNpcChat } from '../three/sim/npcChat';
import { createRng } from '../three/sim/npcSim';

describe('npcChat', () => {
  it('spawns deterministic messages for the same seed', () => {
    const rngA = createRng(100);
    const rngB = createRng(100);
    const stateA = createNpcChatState({ npcCount: 2, seed: 100 }, rngA);
    const stateB = createNpcChatState({ npcCount: 2, seed: 100 }, rngB);

    const spawnedA = stepNpcChat(stateA, 10, rngA);
    const spawnedB = stepNpcChat(stateB, 10, rngB);

    expect(spawnedA[0].text).toBe(spawnedB[0].text);
    expect(spawnedA[0].npcIndex).toBe(spawnedB[0].npcIndex);
  });

  it('reschedules after emitting', () => {
    const rng = createRng(5);
    const state = createNpcChatState({ npcCount: 1, seed: 5, minDelay: 0.1, maxDelay: 0.2, ttl: 1.5 }, rng);
    const first = stepNpcChat(state, 0.15, rng);
    expect(first).toHaveLength(1);

    const none = stepNpcChat(state, 0.05, rng);
    expect(none).toHaveLength(0);
  });
});
