import { render, screen } from '@testing-library/react';
import RoomsPage from '../pages/RoomsPage';

function renderPage() {
  return render(<RoomsPage />);
}

describe('RoomsPage', () => {
  it('renders mock rooms list', () => {
    renderPage();
    expect(
      screen.getAllByText(/Neon Lounge/i, { selector: 'div' }).length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Aurora Atrium/i)).toBeInTheDocument();
    expect(screen.getByText(/Midnight Booth/i)).toBeInTheDocument();
  });

  it('links to hottest room CTA', () => {
    renderPage();
    const cta = screen.getByRole('link', { name: /Join hottest room/i });
    expect(cta).toHaveAttribute('href', '/bar/room-101');
  });
});
