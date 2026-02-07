import { fireEvent, render, screen, within } from '@testing-library/react';
import RoomsPage from '../pages/RoomsPage';

function renderPage() {
  return render(<RoomsPage />);
}

describe('RoomsPage', () => {
  it('renders mock rooms with occupancy and topics', () => {
    renderPage();
    const list = screen.getByLabelText(/Room list/i);
    expect(within(list).getByText(/Neon Lounge/i)).toBeInTheDocument();
    expect(within(list).getByText(/Peak-hour DJ set/i)).toBeInTheDocument();
    expect(within(list).getByText(/52 online/i)).toBeInTheDocument();
  });

  it('filters by theme and updates hottest CTA within the filtered set', () => {
    renderPage();

    const defaultCta = screen.getByRole('link', { name: /Join hottest room/i });
    expect(defaultCta).toHaveAttribute('href', '/bar/room-neon');

    fireEvent.click(screen.getByRole('button', { name: /Karaoke/i }));

    const list = screen.getByLabelText(/Room list/i);
    expect(within(list).getByText(/Midnight Booth/i)).toBeInTheDocument();
    expect(within(list).queryByText(/Neon Lounge/i)).not.toBeInTheDocument();

    const filteredCta = screen.getByRole('link', { name: /Join hottest room/i });
    expect(filteredCta).toHaveAttribute('href', '/bar/room-midnight');
  });
});
