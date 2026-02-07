import { fireEvent, render, screen, within } from '@testing-library/react';
import NearbyPanel from '../ui/components/NearbyPanel';

describe('Safety actions in nearby panel', () => {
  it('mutes a user and shows badge', () => {
    render(<NearbyPanel seed="safety-mute" tickMs={10_000} count={3} />);

    const firstCard = screen.getByTestId('nearby-0');
    fireEvent.click(firstCard);

    const muteButton = screen.getByRole('button', { name: /mute user/i });
    fireEvent.click(muteButton);

    const updatedCard = screen.getByTestId('nearby-0');
    expect(within(updatedCard).getByText(/Muted/)).toBeInTheDocument();
  });

  it('blocks a user and removes from list', () => {
    render(<NearbyPanel seed="safety-block" tickMs={10_000} count={3} />);

    const initialCards = screen.getAllByTestId(/nearby-/);
    const firstCard = initialCards[0];
    fireEvent.click(firstCard);

    const blockButton = screen.getByRole('button', { name: /block user/i });
    fireEvent.click(blockButton);

    const remaining = screen.getAllByTestId(/nearby-/);
    expect(remaining.length).toBe(initialCards.length - 1);
  });
});
