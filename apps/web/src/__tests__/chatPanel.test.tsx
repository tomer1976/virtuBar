import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import ChatPanel from '../ui/components/ChatPanel';

vi.useFakeTimers();

describe('ChatPanel', () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('shows initial messages with timestamps', () => {
    render(<ChatPanel seed="chat-seed" tickMs={10_000} />);
    const list = screen.getByLabelText(/Chat messages/i);
    const messages = within(list).getAllByTestId(/chat-message-/);

    expect(messages.length).toBeGreaterThan(0);
    expect(within(messages[0]).getByLabelText(/Sent at/)).toBeInTheDocument();
  });

  it('sends a message and receives simulated incoming messages', () => {
    render(<ChatPanel seed="chat-seed" tickMs={20} maxMessages={50} />);

    const list = screen.getByLabelText(/Chat messages/i);
    const initialCount = within(list).getAllByTestId(/chat-message-/).length;

    const input = screen.getByLabelText(/Type a message/i);
    fireEvent.change(input, { target: { value: 'Hello world' } });
    fireEvent.click(screen.getByRole('button', { name: /Send/i }));

    const afterSend = within(list).getAllByTestId(/chat-message-/).length;
    expect(afterSend).toBe(initialCount + 1);

    act(() => {
      vi.advanceTimersByTime(25);
    });

    const afterInject = within(list).getAllByTestId(/chat-message-/).length;
    expect(afterInject).toBeGreaterThan(afterSend);
  });

  it('does not inject messages when liveness is disabled', () => {
    render(<ChatPanel seed="chat-seed" tickMs={20} maxMessages={10} enableLiveness={false} />);

    const list = screen.getByLabelText(/Chat messages/i);
    const initialCount = within(list).getAllByTestId(/chat-message-/).length;

    act(() => {
      vi.advanceTimersByTime(200);
    });

    const afterTime = within(list).getAllByTestId(/chat-message-/).length;
    expect(afterTime).toBe(initialCount);
  });
});
