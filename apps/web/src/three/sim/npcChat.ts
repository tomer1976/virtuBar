import { createRng } from './npcSim';

export type NpcChatConfig = {
  npcCount: number;
  seed: number;
  snippets?: string[];
  minDelay?: number;
  maxDelay?: number;
  ttl?: number;
};

export type NpcChatMessage = {
  id: string;
  npcIndex: number;
  text: string;
  ttl: number;
};

export type NpcChatState = {
  timers: number[];
  counter: number;
  snippets: string[];
  minDelay: number;
  maxDelay: number;
  ttl: number;
};

const DEFAULT_SNIPPETS = [
  'Heard the DJ is late.',
  'Anyone tried the new mocktail?',
  'Crowd feels lively tonight.',
  'Stage lights look sharp.',
  'Who is hosting trivia?',
  'Love this track.',
  'Is that your crew over there?',
  'Checking out the upstairs bar.',
];

const DEFAULT_MIN_DELAY = 2.5;
const DEFAULT_MAX_DELAY = 6.5;
const DEFAULT_TTL = 3.6;

export function createNpcChatState(config: NpcChatConfig, rngOverride?: () => number): NpcChatState {
  const rng = rngOverride ?? createRng(config.seed);
  const snippets = config.snippets && config.snippets.length ? config.snippets : DEFAULT_SNIPPETS;
  const minDelay = config.minDelay ?? DEFAULT_MIN_DELAY;
  const maxDelay = config.maxDelay ?? DEFAULT_MAX_DELAY;
  const ttl = config.ttl ?? DEFAULT_TTL;
  const timers = Array.from({ length: config.npcCount }, () => minDelay + (maxDelay - minDelay) * rng());

  return {
    timers,
    counter: 0,
    snippets,
    minDelay,
    maxDelay,
    ttl,
  };
}

export function stepNpcChat(state: NpcChatState, dt: number, rng: () => number): NpcChatMessage[] {
  const spawned: NpcChatMessage[] = [];
  for (let i = 0; i < state.timers.length; i += 1) {
    state.timers[i] -= dt;
    if (state.timers[i] > 0) continue;

    const snippetIdx = Math.floor(rng() * state.snippets.length) % state.snippets.length;
    const id = `npc-chat-${state.counter}`;
    spawned.push({
      id,
      npcIndex: i,
      text: state.snippets[snippetIdx],
      ttl: state.ttl,
    });

    state.counter += 1;
    const delay = state.minDelay + (state.maxDelay - state.minDelay) * rng();
    state.timers[i] = delay;
  }
  return spawned;
}
