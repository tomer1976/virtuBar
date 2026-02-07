import { render, screen, within } from '@testing-library/react';
import ChatPanel from '../ui/components/ChatPanel';
import NearbyPanel from '../ui/components/NearbyPanel';
import { mockEngineConfig } from '../state/mockConfig';

describe('mock engine config defaults', () => {
  it('uses chat defaults for initial thread size', () => {
    render(<ChatPanel enableLiveness={false} />);
    const chatList = screen.getByLabelText('Chat messages');
    const messages = within(chatList).getAllByTestId(/chat-message-/);
    expect(messages).toHaveLength(mockEngineConfig.chat.initialCount);
  });

  it('uses nearby defaults for initial user list', () => {
    render(<NearbyPanel />);
    const nearbyList = screen.getByLabelText('Nearby list');
    const cards = within(nearbyList).getAllByTestId(/nearby-/);
    expect(cards).toHaveLength(mockEngineConfig.nearby.count);
  });
});