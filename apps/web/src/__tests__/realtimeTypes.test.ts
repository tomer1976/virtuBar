import {
  AvatarTransformBroadcastPayload,
  CHAT_MAX_LENGTH,
  ChatBroadcastPayload,
  DESKTOP_TRANSFORM_RATE_LIMIT,
  MOBILE_TRANSFORM_RATE_LIMIT,
  REALTIME_ANIMATIONS,
  REALTIME_CLIENT_EVENT_NAMES,
  REALTIME_SERVER_EVENT_NAMES,
  REALTIME_VERSION,
  RealtimeEnvelope,
} from '../net/realtime/types';

describe('realtime types', () => {
  it('aligns client and server event names with the protocol spec', () => {
    expect(REALTIME_CLIENT_EVENT_NAMES).toEqual([
      'join_room',
      'heartbeat',
      'avatar_transform',
      'local_chat',
      'emote',
    ]);

    expect(REALTIME_SERVER_EVENT_NAMES).toEqual([
      'room_state',
      'member_joined',
      'member_left',
      'avatar_transform_broadcast',
      'chat_broadcast',
      'moderation_action',
      'auth_error',
    ]);
  });

  it('exposes protocol-aligned limits and animations', () => {
    expect(REALTIME_ANIMATIONS).toEqual(['idle', 'walk', 'dance', 'wave']);
    expect(DESKTOP_TRANSFORM_RATE_LIMIT).toBe(20);
    expect(MOBILE_TRANSFORM_RATE_LIMIT).toBe(15);
    expect(CHAT_MAX_LENGTH).toBe(240);
  });

  it('builds a typed envelope for server events', () => {
    const payload: ChatBroadcastPayload = {
      userId: 'user-1',
      text: 'hello',
      messageId: 'msg-1',
    };

    const envelope: RealtimeEnvelope<'chat_broadcast', ChatBroadcastPayload> = {
      v: REALTIME_VERSION,
      t: 'chat_broadcast',
      ts: 1_710_000_000_000,
      payload,
    };

    expect(envelope.payload).toEqual(payload);
    expect(envelope.v).toBe(REALTIME_VERSION);
  });

  it('allows typed transform payloads for broadcast events', () => {
    const payload: AvatarTransformBroadcastPayload = {
      userId: 'user-2',
      seq: 10,
      x: 1,
      y: 0,
      z: -2,
      rotY: 0.5,
      anim: 'walk',
      speaking: false,
    };

    const envelope: RealtimeEnvelope<'avatar_transform_broadcast', AvatarTransformBroadcastPayload> = {
      v: REALTIME_VERSION,
      t: 'avatar_transform_broadcast',
      ts: 1_710_000_100_000,
      payload,
    };

    expect(envelope.payload.anim).toBe('walk');
    expect(envelope.payload.seq).toBe(10);
  });
});
