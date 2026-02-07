import { vi } from 'vitest';
import { CHAT_MAX_LENGTH, DESKTOP_TRANSFORM_RATE_LIMIT, RealtimeEnvelope, RealtimeServerPayloadMap } from '../net/realtime/types';
import { __resetSimStateForTests, createSimProvider } from '../net/realtime/simProvider';

function collectEvents<T extends keyof RealtimeServerPayloadMap>(eventName: T) {
  const events: RealtimeEnvelope<T, RealtimeServerPayloadMap[T]>[] = [];
  return {
    events,
    handler: (event: RealtimeEnvelope<T, RealtimeServerPayloadMap[T]>) => events.push(event),
    eventName,
  };
}

describe('SimRealtimeProvider', () => {
  beforeEach(() => {
    __resetSimStateForTests();
  });

  afterEach(() => {
    __resetSimStateForTests();
    vi.useRealTimers();
  });

  it('joins a room and emits room state and member_joined to others', async () => {
    const providerA = createSimProvider();
    const providerB = createSimProvider();

    await providerA.connect();
    await providerB.connect();

    const aState = collectEvents('room_state');
    const aJoined = collectEvents('member_joined');
    providerA.on(aState.eventName, aState.handler);
    providerA.on(aJoined.eventName, aJoined.handler);

    await providerA.joinRoom({
      roomId: 'room-1',
      deviceType: 'desktop',
      user: { userId: 'user-a', displayName: 'A', avatarId: 'ava' },
    });

    const bState = collectEvents('room_state');
    providerB.on(bState.eventName, bState.handler);
    await providerB.joinRoom({
      roomId: 'room-1',
      deviceType: 'desktop',
      user: { userId: 'user-b', displayName: 'B', avatarId: 'avb' },
    });

    expect(aState.events[0]?.payload.members).toHaveLength(1);
    expect(bState.events[0]?.payload.members).toHaveLength(2);
    expect(aJoined.events[0]?.payload.member.userId).toBe('user-b');
  });

  it('broadcasts transforms within rate limits', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_710_000_000_000);

    const sender = createSimProvider();
    const receiver = createSimProvider();
    await sender.connect();
    await receiver.connect();

    const transforms = collectEvents('avatar_transform_broadcast');
    receiver.on(transforms.eventName, transforms.handler);

    await sender.joinRoom({
      roomId: 'room-rt',
      deviceType: 'desktop',
      user: { userId: 'sender', displayName: 'S', avatarId: 'as' },
    });
    await receiver.joinRoom({
      roomId: 'room-rt',
      deviceType: 'desktop',
      user: { userId: 'receiver', displayName: 'R', avatarId: 'ar' },
    });

    for (let i = 0; i < DESKTOP_TRANSFORM_RATE_LIMIT + 5; i += 1) {
      await sender.sendTransform({
        roomId: 'room-rt',
        seq: i,
        x: i,
        y: 0,
        z: i * -1,
        rotY: 0,
        anim: 'walk',
        speaking: false,
      });
    }

    expect(transforms.events.length).toBeLessThanOrEqual(DESKTOP_TRANSFORM_RATE_LIMIT);
  });

  it('drops chat messages that exceed the max length', async () => {
    const sender = createSimProvider();
    const receiver = createSimProvider();
    await sender.connect();
    await receiver.connect();

    const chats = collectEvents('chat_broadcast');
    receiver.on(chats.eventName, chats.handler);

    await sender.joinRoom({
      roomId: 'room-chat',
      deviceType: 'desktop',
      user: { userId: 'chat-a', displayName: 'A', avatarId: 'aa' },
    });
    await receiver.joinRoom({
      roomId: 'room-chat',
      deviceType: 'desktop',
      user: { userId: 'chat-b', displayName: 'B', avatarId: 'ab' },
    });

    const longText = 'x'.repeat(CHAT_MAX_LENGTH + 5);
    await sender.sendChat({ roomId: 'room-chat', text: longText, mode: 'local' });

    expect(chats.events.length).toBe(0);
  });

  it('broadcasts member_left when leaving a room', async () => {
    const providerA = createSimProvider();
    const providerB = createSimProvider();

    await providerA.connect();
    await providerB.connect();

    const leftEvents = collectEvents('member_left');
    providerA.on(leftEvents.eventName, leftEvents.handler);

    await providerA.joinRoom({
      roomId: 'room-leave',
      deviceType: 'desktop',
      user: { userId: 'user-a', displayName: 'A', avatarId: 'ava' },
    });
    await providerB.joinRoom({
      roomId: 'room-leave',
      deviceType: 'desktop',
      user: { userId: 'user-b', displayName: 'B', avatarId: 'avb' },
    });

    await providerB.leaveRoom('room-leave');
    expect(leftEvents.events[0]?.payload.userId).toBe('user-b');
  });

  it('replays room state on reconnect and resumes events', async () => {
    const providerA = createSimProvider();
    const providerB = createSimProvider();

    await providerA.connect();
    await providerB.connect();

    const stateEventsA = collectEvents('room_state');
    const chatEventsA = collectEvents('chat_broadcast');
    providerA.on(stateEventsA.eventName, stateEventsA.handler);
    providerA.on(chatEventsA.eventName, chatEventsA.handler);

    await providerA.joinRoom({
      roomId: 'room-reconnect',
      user: { userId: 'user-a', displayName: 'A', avatarId: 'ava' },
      deviceType: 'desktop',
    });
    await providerB.joinRoom({
      roomId: 'room-reconnect',
      user: { userId: 'user-b', displayName: 'B', avatarId: 'avb' },
      deviceType: 'desktop',
    });

    await providerA.disconnect();

    await providerB.sendChat({ roomId: 'room-reconnect', text: 'hi after drop', mode: 'local' });

    await providerA.connect();

    expect(stateEventsA.events.length).toBeGreaterThan(1);
    const lastState = stateEventsA.events[stateEventsA.events.length - 1]?.payload;
    expect(lastState?.members.map((m) => m.userId).sort()).toEqual(['user-a', 'user-b']);

    // After reconnect, providerA should get new chat broadcasts
    await providerB.sendChat({ roomId: 'room-reconnect', text: 'welcome back', mode: 'local' });
    expect(chatEventsA.events[chatEventsA.events.length - 1]?.payload.text).toBe('welcome back');
  });

  it('allows two clients to see each other move and chat', async () => {
    const providerA = createSimProvider();
    const providerB = createSimProvider();

    await providerA.connect();
    await providerB.connect();

    const transformsForA = collectEvents('avatar_transform_broadcast');
    const transformsForB = collectEvents('avatar_transform_broadcast');
    const chatsForA = collectEvents('chat_broadcast');
    const chatsForB = collectEvents('chat_broadcast');
    providerA.on(transformsForA.eventName, transformsForA.handler);
    providerB.on(transformsForB.eventName, transformsForB.handler);
    providerA.on(chatsForA.eventName, chatsForA.handler);
    providerB.on(chatsForB.eventName, chatsForB.handler);

    await providerA.joinRoom({
      roomId: 'room-mutual',
      deviceType: 'desktop',
      user: { userId: 'user-a', displayName: 'A', avatarId: 'ava' },
    });
    await providerB.joinRoom({
      roomId: 'room-mutual',
      deviceType: 'desktop',
      user: { userId: 'user-b', displayName: 'B', avatarId: 'avb' },
    });

    await providerA.sendTransform({
      roomId: 'room-mutual',
      seq: 1,
      x: 1,
      y: 0,
      z: 1,
      rotY: 0,
      anim: 'walk',
      speaking: false,
    });
    await providerB.sendTransform({
      roomId: 'room-mutual',
      seq: 1,
      x: -1,
      y: 0,
      z: -1,
      rotY: Math.PI,
      anim: 'walk',
      speaking: true,
    });

    expect(transformsForA.events.some((event) => event.payload.userId === 'user-b')).toBe(true);
    expect(transformsForB.events.some((event) => event.payload.userId === 'user-a')).toBe(true);

    await providerA.sendChat({ roomId: 'room-mutual', text: 'hi from A', mode: 'local' });
    await providerB.sendChat({ roomId: 'room-mutual', text: 'hi from B', mode: 'local' });

    expect(chatsForA.events.some((event) => event.payload.userId === 'user-b' && event.payload.text === 'hi from B')).toBe(true);
    expect(chatsForB.events.some((event) => event.payload.userId === 'user-a' && event.payload.text === 'hi from A')).toBe(true);
  });
});
