export const REALTIME_VERSION = 1 as const;

export const REALTIME_ANIMATIONS = ['idle', 'walk', 'dance', 'wave'] as const;
export const REALTIME_CLIENT_EVENT_NAMES = [
  'join_room',
  'heartbeat',
  'avatar_transform',
  'local_chat',
  'emote',
] as const;
export const REALTIME_SERVER_EVENT_NAMES = [
  'room_state',
  'member_joined',
  'member_left',
  'avatar_transform_broadcast',
  'chat_broadcast',
  'moderation_action',
  'auth_error',
] as const;

export const DESKTOP_TRANSFORM_RATE_LIMIT = 20;
export const MOBILE_TRANSFORM_RATE_LIMIT = 15;
export const CHAT_MAX_LENGTH = 240;
