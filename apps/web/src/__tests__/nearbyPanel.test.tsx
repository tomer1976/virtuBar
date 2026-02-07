import { act, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import NearbyPanel from '../ui/components/NearbyPanel';
import { generateNearbyUsers, sortNearby } from '../state/mockNearby';

vi.useFakeTimers();

describe('NearbyPanel', () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('groups by region and keeps rank order from sortNearby', () => {
    const seed = 'nearby-seed';
    const expected = sortNearby(generateNearbyUsers({ seed }));

    render(<NearbyPanel seed={seed} tickMs={10} />);
    const list = screen.getByLabelText(/Nearby list/i);
    const items = within(list).getAllByTestId(/nearby-/);

    expected.forEach((user, idx) => {
      expect(within(items[idx]).getByText(user.displayName)).toBeInTheDocument();
      expect(within(items[idx]).getByLabelText(new RegExp(`Region ${user.region}`))).toBeInTheDocument();
      expect(within(items[idx]).getByText(`#${idx + 1}`)).toBeInTheDocument();
    });
  });

  it('updates activity over time with drift', () => {
    render(<NearbyPanel seed="nearby-seed" tickMs={20} />);
    const list = screen.getByLabelText(/Nearby list/i);
    const firstItem = within(list).getByTestId('nearby-0');
    const initialActivity = within(firstItem)
      .getByLabelText(/Activity score/)
      .textContent;

    act(() => {
      vi.advanceTimersByTime(25);
    });

    const updatedItem = within(list).getByTestId('nearby-0');
    const updatedActivity = within(updatedItem)
      .getByLabelText(/Activity score/)
      .textContent;

    expect(updatedActivity).not.toBe(initialActivity);
  });
});
