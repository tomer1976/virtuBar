import { createSeededRng, DEFAULT_MOCK_SEED, generateMockData } from './mockDataEngine';

export type ChatMessage = {
  id: string;
  author: string;
  content: string;
  timestamp: number;
  fromSelf?: boolean;
};

export type ChatOptions = {
  seed?: string | number;
  count?: number;
  authorPool?: string[];
};

const cannedLines = [
  'What track is playing?',
  'Queue me for karaoke.',
  'Love this vibe.',
  'Anyone else into synthwave?',
  'Grabbing a mocktail, be right back.',
  'Who is on deck next?',
  'Sound levels are solid here.',
  'Great lighting in this room.',
  'Let us do a duet!',
  'Saving my voice for the finale.',
];

function pick<T>(items: T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)];
}

function buildAuthorPool(seed?: string | number, override?: string[]): string[] {
  if (override?.length) return override;
  const { users } = generateMockData({ seed });
  const authors = users.slice(0, 8).map((user) => user.displayName);
  return authors.length ? authors : ['Guest'];
}

function buildLine(rng: () => number): string {
  return pick(cannedLines, rng);
}

export function generateChatThread(options: ChatOptions = {}): ChatMessage[] {
  const seed = options.seed ?? DEFAULT_MOCK_SEED;
  const count = options.count ?? 6;
  const rng = createSeededRng(`${seed}-chat-seed`);
  const authors = buildAuthorPool(seed, options.authorPool);
  const startTime = Date.now() - count * 45_000;

  const thread: ChatMessage[] = [];
  for (let i = 0; i < count; i += 1) {
    const timestamp = startTime + i * 30_000 + Math.floor(rng() * 10_000);
    thread.push({
      id: `chat-${i}-${Math.floor(rng() * 1_000_000)}`,
      author: authors[i % authors.length],
      content: buildLine(rng),
      timestamp,
    });
  }

  return thread;
}

export function injectIncomingMessage(
  thread: ChatMessage[],
  authorPool: string[],
  rng: () => number,
): ChatMessage[] {
  const timestamp = Date.now();
  const author = pick(authorPool, rng);
  const message: ChatMessage = {
    id: `chat-${thread.length}-${Math.floor(rng() * 1_000_000)}`,
    author,
    content: buildLine(rng),
    timestamp,
  };
  return [...thread, message];
}

export function clampChatHistory(messages: ChatMessage[], max = 30): ChatMessage[] {
  if (messages.length <= max) return messages;
  return messages.slice(messages.length - max);
}

export function formatChatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function buildChatAuthorPool(seed?: string | number, override?: string[]): string[] {
  return buildAuthorPool(seed, override);
}
