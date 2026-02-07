import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createRateLimitedProvider } from '../net/realtime/rateLimitedProvider';
import { CHAT_MAX_LENGTH, DESKTOP_TRANSFORM_RATE_LIMIT, MOBILE_TRANSFORM_RATE_LIMIT } from '../net/realtime/types';

function createMockProvider() {
  return {
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    joinRoom: vi.fn().mockResolvedValue(undefined),
    leaveRoom: vi.fn().mockResolvedValue(undefined),
    sendTransform: vi.fn().mockResolvedValue(undefined),
    sendChat: vi.fn().mockResolvedValue(undefined),
    sendEmote: vi.fn().mockResolvedValue(undefined),
    on: vi.fn().mockReturnValue(() => {}),
  };
}

describe('createRateLimitedProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  it('drops transforms beyond the desktop rate limit', async () => {
    const inner = createMockProvider();
    const provider = createRateLimitedProvider(inner, { deviceType: 'desktop' });

    for (let i = 0; i < DESKTOP_TRANSFORM_RATE_LIMIT + 5; i += 1) {
      await provider.sendTransform({
        seq: i,
        roomId: 'room',
        x: 0,
        y: 0,
        z: 0,
        rotY: 0,
        anim: 'idle',
        speaking: false,
      });
    }

    expect(inner.sendTransform).toHaveBeenCalledTimes(DESKTOP_TRANSFORM_RATE_LIMIT);
  });

  it('drops transforms beyond the mobile rate limit', async () => {
    const inner = createMockProvider();
    const provider = createRateLimitedProvider(inner, { deviceType: 'mobile' });

    for (let i = 0; i < MOBILE_TRANSFORM_RATE_LIMIT + 3; i += 1) {
      await provider.sendTransform({
        seq: i,
        roomId: 'room',
        x: 0,
        y: 0,
        z: 0,
        rotY: 0,
        anim: 'idle',
        speaking: false,
      });
    }

    expect(inner.sendTransform).toHaveBeenCalledTimes(MOBILE_TRANSFORM_RATE_LIMIT);
  });

  it('drops chat messages beyond length limit', async () => {
    const inner = createMockProvider();
    const provider = createRateLimitedProvider(inner, { deviceType: 'desktop' });

    const longText = 'x'.repeat(CHAT_MAX_LENGTH + 5);
    await provider.sendChat({ roomId: 'r', text: longText, mode: 'local' });

    expect(inner.sendChat).not.toHaveBeenCalled();
  });
});
