import { fireEvent, render, screen, within } from '@testing-library/react';
import NearbyPanel from '../ui/components/NearbyPanel';

describe('Profile overlay from nearby list', () => {
  it('opens overlay and shows shared interests', () => {
    render(<NearbyPanel seed="profile-overlay" tickMs={10_000} count={3} />);

    const firstCard = screen.getByTestId('nearby-0');
    fireEvent.click(firstCard);

    const dialog = screen.getByRole('dialog', { name: /Profile/i });
    expect(dialog).toBeInTheDocument();

    const sharedSection = within(dialog).getByText(/Shared interests/i).parentElement;
    expect(sharedSection?.textContent).toMatch(/shared/i);
  });
});
