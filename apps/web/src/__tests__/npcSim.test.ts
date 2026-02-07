import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { createNpcStates, createRng, stepNpcGroup } from '../three/sim/npcSim';

describe('npcSim', () => {
  it('creates deterministic positions for the same seed', () => {
    const a = createNpcStates({ count: 3, seed: 1234 });
    const b = createNpcStates({ count: 3, seed: 1234 });
    expect(a[0].position.x).toBeCloseTo(b[0].position.x);
    expect(a[1].position.z).toBeCloseTo(b[1].position.z);
  });

  it('advances toward targets when walking', () => {
    const rng = createRng(42);
    const [npc] = createNpcStates({ count: 1, seed: 42 }, rng);
    npc.state = 'walk';
    npc.target = npc.position.clone().add(new THREE.Vector3(1, 0, 0));
    const before = npc.position.x;
    stepNpcGroup([npc], 1, createRng(99));
    expect(npc.position.x).toBeGreaterThan(before);
  });
});
