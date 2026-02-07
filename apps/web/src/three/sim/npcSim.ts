import * as THREE from 'three';

export type NpcState = {
  id: number;
  position: THREE.Vector3;
  target: THREE.Vector3;
  minRadius: number;
  maxRadius: number;
  speed: number;
  state: 'idle' | 'walk';
  timer: number;
  phase: number;
  color: number;
  heading: number;
};

export type NpcSimConfig = {
  count: number;
  seed: number;
  minRadius?: number;
  maxRadius?: number;
  minSpeed?: number;
  maxSpeed?: number;
};

// Keep NPCs clustered near the interior; tuned for current venue scale.
const DEFAULT_MIN_RADIUS = 1.0;
const DEFAULT_MAX_RADIUS = 2.2;
const DEFAULT_MIN_SPEED = 0.7;
const DEFAULT_MAX_SPEED = 1.25;

export function createRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export function createNpcStates(config: NpcSimConfig, rngOverride?: () => number): NpcState[] {
  const {
    count,
    seed,
    minRadius = DEFAULT_MIN_RADIUS,
    maxRadius = DEFAULT_MAX_RADIUS,
    minSpeed = DEFAULT_MIN_SPEED,
    maxSpeed = DEFAULT_MAX_SPEED,
  } = config;
  const rng = rngOverride ?? createRng(seed);
  const palette = [0xf97316, 0x22d3ee, 0x22c55e, 0xa855f7, 0xfacc15, 0xf472b6];
  const states: NpcState[] = [];

  for (let i = 0; i < count; i += 1) {
    const radius = minRadius + (maxRadius - minRadius) * rng();
    const angle = rng() * Math.PI * 2;
    const y = 0.3;
    const position = new THREE.Vector3(
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius,
    );
    const target = position.clone();
    const speed = minSpeed + (maxSpeed - minSpeed) * rng();
    const color = palette[i % palette.length];
    const idleDuration = 1 + rng() * 2;
    const phase = rng() * Math.PI * 2;
    const heading = angle;

    states.push({
      id: i,
      position,
      target,
      minRadius,
      maxRadius,
      speed,
      color,
      heading,
      state: 'idle',
      timer: idleDuration,
      phase,
    });
  }

  return states;
}

export function chooseNewTarget(
  state: NpcState,
  rng: () => number,
  minRadius = state.minRadius ?? DEFAULT_MIN_RADIUS,
  maxRadius = state.maxRadius ?? DEFAULT_MAX_RADIUS,
) {
  const radius = minRadius + (maxRadius - minRadius) * rng();
  const angle = rng() * Math.PI * 2;
  state.target.set(Math.cos(angle) * radius, state.position.y, Math.sin(angle) * radius);
}

export function stepNpc(state: NpcState, dt: number, rng: () => number) {
  if (state.state === 'idle') {
    state.timer -= dt;
    if (state.timer <= 0) {
      chooseNewTarget(state, rng, state.minRadius, state.maxRadius);
      state.state = 'walk';
    }
    return;
  }

  const toTarget = new THREE.Vector3().subVectors(state.target, state.position);
  const distance = toTarget.length();
  if (distance < 0.05) {
    state.state = 'idle';
    state.timer = 1 + rng() * 2.5;
    return;
  }

  const direction = toTarget.normalize();
  state.position.addScaledVector(direction, state.speed * dt);
  state.phase += dt * 6;
  state.heading = Math.atan2(direction.x, direction.z);
}

export function stepNpcGroup(states: NpcState[], dt: number, rng: () => number) {
  for (const state of states) {
    stepNpc(state, dt, rng);
  }
}
