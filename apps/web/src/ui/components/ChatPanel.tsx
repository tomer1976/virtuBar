import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input } from '.';
import {
  buildChatAuthorPool,
  clampChatHistory,
  formatChatTimestamp,
  generateChatThread,
  injectIncomingMessage,
} from '../../state/mockChat';
import { createSeededRng } from '../../state/mockDataEngine';
import { mockEngineConfig } from '../../state/mockConfig';

export type ChatMessage = {
  id: string;
  author: string;
  content: string;
  timestamp: number;
  fromSelf?: boolean;
};

export type ChatPanelProps = {
  seed?: string | number;
  initialCount?: number;
  tickMs?: number;
  maxMessages?: number;
  enableLiveness?: boolean;
  realtimeMessages?: ChatMessage[];
  onSendRealtime?: (text: string) => Promise<void> | void;
  selfUserId?: string;
};

function ChatPanel({
  seed,
  initialCount = mockEngineConfig.chat.initialCount,
  tickMs = mockEngineConfig.chat.tickMs,
  maxMessages = mockEngineConfig.chat.maxMessages,
  enableLiveness = true,
  realtimeMessages,
  onSendRealtime,
  selfUserId,
}: ChatPanelProps) {
  const resolvedSeed = seed ?? mockEngineConfig.seed;
  const authorPool = useMemo(() => buildChatAuthorPool(resolvedSeed), [resolvedSeed]);
  const initialThread = useMemo(
    () => generateChatThread({ seed: resolvedSeed, count: initialCount, authorPool }),
    [resolvedSeed, initialCount, authorPool],
  );
  const [messages, setMessages] = useState(initialThread);
  const [draft, setDraft] = useState('');
  const rngRef = useRef<() => number>();

  const isRealtime = Boolean(realtimeMessages);

  const displayMessages: ChatMessage[] = useMemo(() => {
    if (!isRealtime) return messages;
    return realtimeMessages!.map((msg) => ({
      ...msg,
      fromSelf: msg.fromSelf ?? (selfUserId ? msg.id.includes(selfUserId) : false),
    }));
  }, [isRealtime, messages, realtimeMessages, selfUserId]);

  useEffect(() => {
    if (isRealtime) return undefined;
    setMessages(initialThread);
    return undefined;
  }, [initialThread, isRealtime]);

  useEffect(() => {
    rngRef.current = createSeededRng(`${resolvedSeed}-chat-drift`);
  }, [resolvedSeed]);

  useEffect(() => {
    if (isRealtime || !enableLiveness) return undefined;
    const id = window.setInterval(() => {
      setMessages((prev) =>
        clampChatHistory(
          injectIncomingMessage(prev, authorPool, rngRef.current ?? (() => Math.random())),
          maxMessages,
        ),
      );
    }, tickMs);
    return () => window.clearInterval(id);
  }, [authorPool, tickMs, maxMessages, enableLiveness, isRealtime]);

  const handleSend = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;

    if (isRealtime && onSendRealtime) {
      void onSendRealtime(trimmed);
      setDraft('');
      return;
    }

    setMessages((prev) =>
      clampChatHistory(
        [
          ...prev,
          {
            id: `chat-self-${Date.now()}`,
            author: 'You',
            content: trimmed,
            timestamp: Date.now(),
            fromSelf: true,
          },
        ],
        maxMessages,
      ),
    );
    setDraft('');
  };

  return (
    <div className="panel" aria-label="Local chat" style={{ display: 'grid', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0 }}>Local Chat</h3>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Mocked chat with timestamps and simulated incoming messages.
          </p>
        </div>
        {!isRealtime ? (
          <Button variant="ghost" onClick={() => setMessages(initialThread)} type="button">
            Reset
          </Button>
        ) : null}
      </div>

      <div
        aria-label="Chat messages"
        style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}
      >
        {displayMessages.map((message, idx) => (
          <div
            key={message.id}
            data-testid={`chat-message-${idx}`}
            className="route-chip"
            style={{ textAlign: 'left' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{message.author}</span>
              <time
                style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}
                aria-label={`Sent at ${formatChatTimestamp(message.timestamp)}`}
              >
                {formatChatTimestamp(message.timestamp)}
              </time>
            </div>
            <div style={{ marginTop: '4px', color: message.fromSelf ? 'var(--color-text)' : undefined }}>
              {message.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }} aria-label="Send a chat message">
        <Input
          aria-label="Type a message"
          placeholder="Say something..."
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}

export default ChatPanel;
