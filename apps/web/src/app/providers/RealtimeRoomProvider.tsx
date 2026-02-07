import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { detectDeviceType } from '../../net/realtime/rateLimitedProvider';
import { AvatarTransformState, LocalChatPayload, RoomMemberState } from '../../net/realtime/types';
import { useRealtimeClient } from './RealtimeClientProvider';
import { useRealtimeIdentity } from './RealtimeIdentityProvider';

export type HudChat = {
  id: string;
  userId: string;
  author: string;
  content: string;
  timestamp: number;
  fromSelf: boolean;
};

type RealtimeRoomContextValue = {
  roomId: string;
  members: RoomMemberState[];
  chats: HudChat[];
  sendChat: (text: string) => Promise<void>;
  sendTransform: (transform: Omit<AvatarTransformState, 'roomId' | 'seq'>) => Promise<void>;
};

const RealtimeRoomContext = createContext<RealtimeRoomContextValue | undefined>(undefined);

export function RealtimeRoomProvider({ roomId, children }: PropsWithChildren<{ roomId: string }>) {
  const { provider } = useRealtimeClient();
  const { identity } = useRealtimeIdentity();
  const [members, setMembers] = useState<RoomMemberState[]>([]);
  const [chats, setChats] = useState<HudChat[]>([]);
  const membersRef = useRef<RoomMemberState[]>([]);
  const transformSeqRef = useRef(0);

  useEffect(() => {
    let unsubscribes: Array<() => void> = [];
    let active = true;

    async function setup() {
      await provider.connect();
      await provider.joinRoom({
        roomId,
        deviceType: detectDeviceType(),
        user: identity,
      });

      unsubscribes = [
        provider.on('room_state', (event) => {
          if (!active) return;
          membersRef.current = event.payload.members;
          setMembers(event.payload.members);
        }),
        provider.on('member_joined', (event) => {
          if (!active) return;
          setMembers((prev) => {
            const others = prev.filter((m) => m.userId !== event.payload.member.userId);
            const next = [...others, event.payload.member];
            membersRef.current = next;
            return next;
          });
        }),
        provider.on('member_left', (event) => {
          if (!active) return;
          setMembers((prev) => {
            const next = prev.filter((m) => m.userId !== event.payload.userId);
            membersRef.current = next;
            return next;
          });
        }),
        provider.on('chat_broadcast', (event) => {
          if (!active) return;
          setChats((prev) => {
            const author = membersRef.current.find((m) => m.userId === event.payload.userId)?.displayName ?? event.payload.userId;
            const message: HudChat = {
              id: event.payload.messageId,
              userId: event.payload.userId,
              author,
              content: event.payload.text,
              timestamp: event.ts,
              fromSelf: event.payload.userId === identity.userId,
            };
            const next = [...prev, message];
            if (next.length > 120) next.shift();
            return next;
          });
        }),
      ];
    }

    void setup();

    return () => {
      active = false;
      unsubscribes.forEach((fn) => fn());
      provider.leaveRoom(roomId).catch(() => {
        // ignore
      });
    };
  }, [identity, provider, roomId]);

  const sendChat = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const payload: LocalChatPayload = { roomId, text: trimmed, mode: 'local' };
      await provider.sendChat(payload);
    },
    [provider, roomId],
  );

  const sendTransform = useCallback(
    async (transform: Omit<AvatarTransformState, 'roomId' | 'seq'>) => {
      const seq = (transformSeqRef.current += 1);
      await provider.sendTransform({ ...transform, roomId, seq });
    },
    [provider, roomId],
  );

  const value = useMemo<RealtimeRoomContextValue>(
    () => ({ roomId, members, chats, sendChat, sendTransform }),
    [roomId, members, chats, sendChat, sendTransform],
  );

  return <RealtimeRoomContext.Provider value={value}>{children}</RealtimeRoomContext.Provider>;
}

export function useRealtimeRoom(): RealtimeRoomContextValue {
  const ctx = useContext(RealtimeRoomContext);
  if (!ctx) {
    throw new Error('useRealtimeRoom must be used within RealtimeRoomProvider');
  }
  return ctx;
}
