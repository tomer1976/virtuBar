import {
  CHAT_MAX_LENGTH,
  DESKTOP_TRANSFORM_RATE_LIMIT,
  MOBILE_TRANSFORM_RATE_LIMIT,
  REALTIME_ANIMATIONS,
  REALTIME_CLIENT_EVENT_NAMES,
  REALTIME_SERVER_EVENT_NAMES,
  REALTIME_VERSION,
} from './constants';

export type RealtimeAnimation = (typeof REALTIME_ANIMATIONS)[number];
export type RealtimeClientEventName = (typeof REALTIME_CLIENT_EVENT_NAMES)[number];
export type RealtimeServerEventName = (typeof REALTIME_SERVER_EVENT_NAMES)[number];

export type DeviceType = 'desktop' | 'mobile' | 'vr';
export type EmoteId = 'cheers' | 'laugh' | 'wave' | string;

export {
  REALTIME_VERSION,
  REALTIME_ANIMATIONS,
  REALTIME_CLIENT_EVENT_NAMES,
  REALTIME_SERVER_EVENT_NAMES,
  DESKTOP_TRANSFORM_RATE_LIMIT,
  MOBILE_TRANSFORM_RATE_LIMIT,
  CHAT_MAX_LENGTH,
};

export interface RealtimeUserIdentity {
  userId: string;
  displayName: string;
  avatarId: string;
}

export interface AvatarTransformState {
  roomId: string;
  seq: number;
  x: number;
  y: number;
  z: number;
  rotY: number;
  anim: RealtimeAnimation;
  speaking: boolean;
}

export interface RoomMemberState extends RealtimeUserIdentity {
  x: number;
  y: number;
  z: number;
  rotY: number;
  anim: RealtimeAnimation;
  speaking: boolean;
}

export interface RoomStatePayload {
  roomId: string;
  serverTimeMs: number;
  members: RoomMemberState[];
}

export interface MemberJoinedPayload {
  member: RoomMemberState;
}

export interface MemberLeftPayload {
  userId: string;
}

export interface AvatarTransformBroadcastPayload {
  userId: string;
  seq: number;
  x: number;
  y: number;
  z: number;
  rotY: number;
  anim: RealtimeAnimation;
  speaking: boolean;
}

export interface ChatBroadcastPayload {
  userId: string;
  text: string;
  messageId: string;
}

export interface ModerationActionPayload {
  type: 'kicked' | 'banned' | 'mutedByMod';
  reason?: string;
}

export interface AuthErrorPayload {
  reason: 'token_expired' | 'invalid_token' | 'forbidden';
  message?: string;
}

export type RealtimeServerPayloadMap = {
  room_state: RoomStatePayload;
  member_joined: MemberJoinedPayload;
  member_left: MemberLeftPayload;
  avatar_transform_broadcast: AvatarTransformBroadcastPayload;
  chat_broadcast: ChatBroadcastPayload;
  moderation_action: ModerationActionPayload;
  auth_error: AuthErrorPayload;
};

export interface JoinRoomPayload {
  roomId: string;
  user: RealtimeUserIdentity;
  deviceType: DeviceType;
}

export interface HeartbeatPayload {
  roomId: string;
  clientTimeMs: number;
  lastSeq?: number;
}

export interface LocalChatPayload {
  roomId: string;
  text: string;
  mode: 'local';
}

export interface EmotePayload {
  roomId: string;
  emoteId: EmoteId;
}

export type RealtimeClientPayloadMap = {
  join_room: JoinRoomPayload;
  heartbeat: HeartbeatPayload;
  avatar_transform: AvatarTransformState;
  local_chat: LocalChatPayload;
  emote: EmotePayload;
};

export type RealtimeEnvelope<TName extends string, TPayload> = {
  v: typeof REALTIME_VERSION;
  t: TName;
  ts: number;
  payload: TPayload;
};

export type RealtimeEventHandler<TName extends RealtimeServerEventName> = (
  event: RealtimeEnvelope<TName, RealtimeServerPayloadMap[TName]>,
) => void;

export interface RealtimeProvider {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  joinRoom(payload: JoinRoomPayload): Promise<void>;
  leaveRoom(roomId: string): Promise<void>;
  sendTransform(payload: AvatarTransformState): Promise<void>;
  sendChat(payload: LocalChatPayload): Promise<void>;
  sendEmote(payload: EmotePayload): Promise<void>;
  on<TName extends RealtimeServerEventName>(
    event: TName,
    handler: RealtimeEventHandler<TName>,
  ): () => void;
}
