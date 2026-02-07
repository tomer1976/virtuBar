import { CHAT_MAX_LENGTH, DESKTOP_TRANSFORM_RATE_LIMIT, MOBILE_TRANSFORM_RATE_LIMIT, REALTIME_VERSION } from './constants';
import {
  AvatarTransformState,
  JoinRoomPayload,
  LocalChatPayload,
  EmotePayload,
  RealtimeEnvelope,
  RealtimeEventHandler,
  RealtimeProvider,
  RealtimeServerEventName,
  RealtimeServerPayloadMap,
  RoomMemberState,
} from './types';

const RATE_LIMIT_WINDOW_MS = 1000;

type SimRoom = {
  members: Map<string, RoomMemberState>;
  messageCounter: number;
};

const rooms: Map<string, SimRoom> = new Map();
const activeProviders: Set<SimRealtimeProvider> = new Set();

function now() {
  return Date.now();
}

function buildEnvelope<TName extends RealtimeServerEventName>(
  t: TName,
  payload: RealtimeServerPayloadMap[TName],
): RealtimeEnvelope<TName, RealtimeServerPayloadMap[TName]> {
  return {
    v: REALTIME_VERSION,
    t,
    ts: now(),
    payload,
  };
}

function getOrCreateRoom(roomId: string): SimRoom {
  const existing = rooms.get(roomId);
  if (existing) return existing;
  const fresh: SimRoom = {
    members: new Map(),
    messageCounter: 0,
  };
  rooms.set(roomId, fresh);
  return fresh;
}

function nextMessageId(room: SimRoom) {
  room.messageCounter += 1;
  return `msg-${room.messageCounter}`;
}

type ServerEnvelope = RealtimeEnvelope<
  RealtimeServerEventName,
  RealtimeServerPayloadMap[RealtimeServerEventName]
>;

export class SimRealtimeProvider implements RealtimeProvider {
  private connected = false;
  private handlers: Map<RealtimeServerEventName, Set<RealtimeEventHandler<RealtimeServerEventName>>> = new Map();
  private currentRoomId: string | null = null;
  private userId: string | null = null;
  private deviceType: 'desktop' | 'mobile' | 'vr' = 'desktop';
  private transformTimestamps: number[] = [];

  async connect(): Promise<void> {
    if (this.connected) return;
    this.connected = true;
    activeProviders.add(this);

    if (this.currentRoomId && this.userId) {
      const room = rooms.get(this.currentRoomId);
      if (room) {
        this.emitToSelf(
          buildEnvelope('room_state', {
            roomId: this.currentRoomId,
            serverTimeMs: now(),
            members: Array.from(room.members.values()),
          }),
        );
      }
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    activeProviders.delete(this);
    this.transformTimestamps = [];
  }

  async joinRoom(payload: JoinRoomPayload): Promise<void> {
    if (!this.connected) {
      throw new Error('Provider not connected');
    }
    this.currentRoomId = payload.roomId;
    this.userId = payload.user.userId;
    this.deviceType = payload.deviceType;

    const room = getOrCreateRoom(payload.roomId);
    const memberState: RoomMemberState = {
      ...payload.user,
      x: 0,
      y: 0,
      z: 0,
      rotY: 0,
      anim: 'idle',
      speaking: false,
    };

    room.members.set(memberState.userId, memberState);

    this.emitToSelf(
      buildEnvelope('room_state', {
        roomId: payload.roomId,
        serverTimeMs: now(),
        members: Array.from(room.members.values()),
      }),
    );

    this.broadcastToRoom(
      payload.roomId,
      buildEnvelope('member_joined', {
        member: memberState,
      }),
      { excludeUserId: this.userId },
    );
  }

  async leaveRoom(roomId: string): Promise<void> {
    if (this.currentRoomId !== roomId || !this.userId) return;
    const room = rooms.get(roomId);
    if (room) {
      room.members.delete(this.userId);
      this.broadcastToRoom(
        roomId,
        buildEnvelope('member_left', {
          userId: this.userId,
        }),
        { excludeUserId: this.userId },
      );
    }
    this.currentRoomId = null;
    this.userId = null;
    this.transformTimestamps = [];
  }

  async sendTransform(payload: AvatarTransformState): Promise<void> {
    if (!this.currentRoomId || !this.userId) return;

    if (!this.allowTransform(now())) {
      return;
    }

    const room = rooms.get(this.currentRoomId);
    if (!room) return;

    const member = room.members.get(this.userId);
    if (!member) return;

    const updated: RoomMemberState = {
      ...member,
      x: payload.x,
      y: payload.y,
      z: payload.z,
      rotY: payload.rotY,
      anim: payload.anim,
      speaking: payload.speaking,
    };

    room.members.set(this.userId, updated);

    const envelope = buildEnvelope('avatar_transform_broadcast', {
      userId: this.userId,
      seq: payload.seq,
      x: payload.x,
      y: payload.y,
      z: payload.z,
      rotY: payload.rotY,
      anim: payload.anim,
      speaking: payload.speaking,
    });

    this.broadcastToRoom(this.currentRoomId, envelope);
  }

  async sendChat(payload: LocalChatPayload): Promise<void> {
    if (!this.currentRoomId || !this.userId) return;
    if (!payload.text || payload.text.length > CHAT_MAX_LENGTH) return;

    const room = rooms.get(this.currentRoomId);
    if (!room) return;

    const envelope = buildEnvelope('chat_broadcast', {
      userId: this.userId,
      text: payload.text,
      messageId: nextMessageId(room),
    });

    this.broadcastToRoom(this.currentRoomId, envelope);
  }

  async sendEmote(_payload: EmotePayload): Promise<void> {
    void _payload;
  }

  on<TName extends RealtimeServerEventName>(
    event: TName,
    handler: RealtimeEventHandler<TName>,
  ): () => void {
    const handlersForEvent =
      (this.handlers.get(event) as
        | Set<RealtimeEventHandler<RealtimeServerEventName>>
        | undefined) ?? new Set();
    handlersForEvent.add(handler as RealtimeEventHandler<RealtimeServerEventName>);
    this.handlers.set(event, handlersForEvent);

    return () => {
      handlersForEvent.delete(handler as RealtimeEventHandler<RealtimeServerEventName>);
    };
  }

  private emitToSelf(envelope: ServerEnvelope) {
    const handlers = this.handlers.get(envelope.t);
    handlers?.forEach((handler) => handler(envelope as never));
  }

  private broadcastToRoom(
    roomId: string,
    envelope: ServerEnvelope,
    options?: { excludeUserId?: string | null },
  ) {
    activeProviders.forEach((provider) => {
      if (provider.currentRoomId !== roomId) return;
      if (options?.excludeUserId && provider.userId === options.excludeUserId) return;
      provider.emitToSelf(envelope);
    });
  }

  private allowTransform(timestamp: number): boolean {
    const limit = this.deviceType === 'mobile' ? MOBILE_TRANSFORM_RATE_LIMIT : DESKTOP_TRANSFORM_RATE_LIMIT;
    this.transformTimestamps = this.transformTimestamps.filter((t) => timestamp - t < RATE_LIMIT_WINDOW_MS);
    if (this.transformTimestamps.length >= limit) {
      return false;
    }
    this.transformTimestamps.push(timestamp);
    return true;
  }
}

export function createSimProvider(): RealtimeProvider {
  return new SimRealtimeProvider();
}

export function __resetSimStateForTests() {
  rooms.clear();
  activeProviders.clear();
}
