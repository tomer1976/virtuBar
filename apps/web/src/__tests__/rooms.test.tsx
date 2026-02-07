import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import RoomsPage from '../pages/RoomsPage';
import {
  createSeededRng,
  DEFAULT_MOCK_SEED,
  driftRoomsOccupancy,
  generateMockData,
} from '../state/mockDataEngine';
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
    const card = within(list).getByText(firstRoom.name).closest('.route-chip') as HTMLElement;
    expect(card).toBeTruthy();
    expect(within(card).getByText(firstRoom.topic)).toBeInTheDocument();
    expect(within(card).getByText(new RegExp(`${firstRoom.occupants} online`))).toBeInTheDocument();
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

  it('drifts occupancy over time without reload', () => {
    vi.useFakeTimers();
    const seed = 'drift-seed';
    const { rooms } = generateMockData({ seed });
    render(<RoomsPage seed={seed} driftMs={20} enableDrift />);

    const list = screen.getByLabelText(/Room list/i);
    const firstRoom = rooms[0];
    const roomCard = within(list).getByText(firstRoom.name).closest('.route-chip') as HTMLElement;
    expect(roomCard).toBeTruthy();
    expect(within(roomCard).getByText(new RegExp(`${firstRoom.occupants} online`))).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(25);
    });

    const expectedRooms = driftRoomsOccupancy(rooms, createSeededRng(`${seed}-drift`));
    const updatedCard = within(list).getByText(firstRoom.name).closest('.route-chip') as HTMLElement;
    expect(updatedCard).toBeTruthy();
    expect(within(updatedCard).getByText(new RegExp(`${expectedRooms[0].occupants} online`))).toBeInTheDocument();
    vi.useRealTimers();
  });
});
