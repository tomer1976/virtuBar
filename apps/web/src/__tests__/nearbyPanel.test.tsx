import { act, fireEvent, render, screen, within } from '@testing-library/react';
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

  it('keeps profile overlay accessible after list updates', () => {
    render(<NearbyPanel seed="nearby-profile" tickMs={20} count={4} />);

    const firstBefore = screen.getByTestId('nearby-0').textContent;

    act(() => {
      vi.advanceTimersByTime(40);
    });

    const firstAfter = screen.getByTestId('nearby-0').textContent;
    expect(firstAfter).not.toBe(firstBefore);

    fireEvent.click(screen.getByTestId('nearby-1'));
    expect(screen.getByRole('dialog', { name: /Profile/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Close/i }));
    expect(screen.queryByRole('dialog', { name: /Profile/i })).not.toBeInTheDocument();
  });
});
