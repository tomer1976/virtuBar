import { fireEvent, render, screen, within } from '@testing-library/react';
import RoomsPage from '../pages/RoomsPage';
import { DEFAULT_MOCK_SEED, generateMockData } from '../state/mockDataEngine';
import { getHottestRoom, mockRoomFilters } from '../state/mockRooms';

function renderPage() {
  return render(<RoomsPage />);
}

describe('RoomsPage', () => {
  it('renders mock rooms with occupancy and topics', () => {
    renderPage();
    const { rooms } = generateMockData({ seed: DEFAULT_MOCK_SEED });
    const list = screen.getByLabelText(/Room list/i);
    const firstRoom = rooms[0];
    expect(within(list).getByText(firstRoom.name)).toBeInTheDocument();
    expect(within(list).getByText(firstRoom.topic)).toBeInTheDocument();
    expect(within(list).getByText(new RegExp(`${firstRoom.occupants} online`))).toBeInTheDocument();
  });

  it('filters by theme and updates hottest CTA within the filtered set', () => {
    renderPage();

    const { rooms } = generateMockData({ seed: DEFAULT_MOCK_SEED });
    const hottestDefault = getHottestRoom(rooms);
    const defaultCta = screen.getByRole('link', { name: /Join hottest room/i });
    expect(defaultCta).toHaveAttribute('href', `/bar/${hottestDefault.id}`);

    const targetTheme = rooms[0].theme;
    const targetLabel = mockRoomFilters.find((f) => f.value === targetTheme)?.label ?? targetTheme;
    fireEvent.click(screen.getByRole('button', { name: targetLabel }));

    const list = screen.getByLabelText(/Room list/i);
    const filteredRooms = rooms.filter((room) => room.theme === targetTheme);
    filteredRooms.forEach((room) => {
      expect(within(list).getByText(room.name)).toBeInTheDocument();
    });

    const otherRoom = rooms.find((room) => room.theme !== targetTheme);
    if (otherRoom) {
      expect(within(list).queryByText(otherRoom.name)).not.toBeInTheDocument();
    }

    const filteredHottest = getHottestRoom(filteredRooms);
    const filteredCta = screen.getByRole('link', { name: /Join hottest room/i });
    expect(filteredCta).toHaveAttribute('href', `/bar/${filteredHottest.id}`);
  });
});
