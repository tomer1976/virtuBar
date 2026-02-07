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

  it('reports a user, shows badge, and keeps state when reopening overlay', () => {
    render(<NearbyPanel seed="safety-report" tickMs={10_000} count={3} />);

    const firstCard = screen.getByTestId('nearby-0');
    fireEvent.click(firstCard);

    fireEvent.click(screen.getByRole('button', { name: /report user/i }));
    expect(within(firstCard).getByText(/Reported/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Close/i }));
    expect(screen.queryByRole('dialog', { name: /Profile/i })).not.toBeInTheDocument();

    fireEvent.click(firstCard);
    expect(screen.getByRole('dialog', { name: /Profile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Report user/i }).textContent).toMatch(/Reported/i);
  });
});
