import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input } from '.';
import {
  buildChatAuthorPool,
  clampChatHistory,
  formatChatTimestamp,
  generateChatThread,
  injectIncomingMessage,
} from '../../state/mockChat';
import { createSeededRng, DEFAULT_MOCK_SEED } from '../../state/mockDataEngine';

export type ChatPanelProps = {
  seed?: string | number;
  initialCount?: number;
  tickMs?: number;
  maxMessages?: number;
  enableLiveness?: boolean;
};

function ChatPanel({
  seed,
  initialCount = 6,
  tickMs = 5000,
  maxMessages = 30,
  enableLiveness = true,
}: ChatPanelProps) {
  const authorPool = useMemo(() => buildChatAuthorPool(seed ?? DEFAULT_MOCK_SEED), [seed]);
  const initialThread = useMemo(
    () => generateChatThread({ seed: seed ?? DEFAULT_MOCK_SEED, count: initialCount, authorPool }),
    [seed, initialCount, authorPool],
  );
  const [messages, setMessages] = useState(initialThread);
  const [draft, setDraft] = useState('');
  const rngRef = useRef<() => number>();

  useEffect(() => {
    setMessages(initialThread);
  }, [initialThread]);

  useEffect(() => {
    rngRef.current = createSeededRng(`${seed ?? DEFAULT_MOCK_SEED}-chat-drift`);
  }, [seed]);

  useEffect(() => {
    if (!enableLiveness) return undefined;
    const id = window.setInterval(() => {
      setMessages((prev) =>
        clampChatHistory(
          injectIncomingMessage(prev, authorPool, rngRef.current ?? (() => Math.random())),
          maxMessages,
        ),
      );
    }, tickMs);
    return () => window.clearInterval(id);
  }, [authorPool, tickMs, maxMessages, enableLiveness]);

  const handleSend = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;

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
        <Button variant="ghost" onClick={() => setMessages(initialThread)} type="button">
          Reset
        </Button>
      </div>

      <div
        aria-label="Chat messages"
        style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto' }}
      >
        {messages.map((message, idx) => (
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
