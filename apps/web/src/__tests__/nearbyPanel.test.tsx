import { act, render, screen, within } from '@testing-library/react';
import { vi } from 'vitest';
import NearbyPanel from '../ui/components/NearbyPanel';

vi.useFakeTimers();

describe('NearbyPanel', () => {
  afterEach(() => {
    vi.clearAllTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('sorts nearby users by distance and shows rank', () => {
    render(<NearbyPanel seed="nearby-seed" tickMs={10} />);
    const list = screen.getByLabelText(/Nearby list/i);
    const items = within(list).getAllByTestId(/nearby-/);
    const distances = items.map((item) => {
      const text = within(item).getByLabelText(/Distance/).textContent ?? '';
      const match = text.match(/([0-9]+\.[0-9])/);
      return match ? parseFloat(match[1]) : Number.MAX_VALUE;
    });
    const sorted = [...distances].sort((a, b) => a - b);
    expect(distances).toEqual(sorted);
    expect(within(items[0]).getByText('#1')).toBeInTheDocument();
  });

  it('updates distances over time with drift', () => {
    render(<NearbyPanel seed="nearby-seed" tickMs={20} />);
    const list = screen.getByLabelText(/Nearby list/i);
    const firstItem = within(list).getByTestId('nearby-0');
    const initialText = within(firstItem).getByLabelText(/Distance/).textContent ?? '';

    act(() => {
      vi.advanceTimersByTime(25);
    });

    const updatedItem = within(list).getByTestId('nearby-0');
    const updatedText = within(updatedItem).getByLabelText(/Distance/).textContent ?? '';
    expect(updatedText).not.toBe(initialText);
  });
});
