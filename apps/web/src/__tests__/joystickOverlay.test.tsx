import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import JoystickOverlay from '../ui/components/JoystickOverlay';

describe('JoystickOverlay', () => {
  it('shows controls when visible', () => {
    render(<JoystickOverlay visible invertYAxis={false} />);
    expect(screen.getByLabelText(/Mobile controls HUD/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Move pad/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Look pad/i)).toBeInTheDocument();
    expect(screen.getByText(/Jump/i)).toBeInTheDocument();
    expect(screen.getByText(/Push-to-talk/i)).toBeInTheDocument();
  });

  it('hides when not visible', () => {
    const { container } = render(<JoystickOverlay visible={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows invert badge when enabled', () => {
    render(<JoystickOverlay visible invertYAxis />);
    expect(screen.getByText(/Invert Y/i)).toBeInTheDocument();
  });

  it('emits movement vector on drag', () => {
    const onMove = vi.fn();
    render(<JoystickOverlay visible onMove={onMove} />);
    const pad = screen.getByLabelText(/Move pad/i) as HTMLDivElement;
    Object.defineProperty(pad, 'getBoundingClientRect', {
      value: () => ({ width: 140, height: 140, left: 0, top: 0, right: 140, bottom: 140, x: 0, y: 0, toJSON: () => {} }),
    });

    fireEvent.pointerDown(pad, { clientX: 70, clientY: 70 });
    fireEvent.pointerMove(pad, { clientX: 105, clientY: 70 });

    expect(onMove).toHaveBeenCalled();
    const last = onMove.mock.calls[onMove.mock.calls.length - 1][0];
    expect(Number.isFinite(last.x)).toBe(true);
  });

  it('emits look delta on drag', () => {
    const onLookDelta = vi.fn();
    render(<JoystickOverlay visible onLookDelta={onLookDelta} />);
    const pad = screen.getByLabelText(/Look pad/i) as HTMLDivElement;
    Object.defineProperty(pad, 'getBoundingClientRect', {
      value: () => ({ width: 140, height: 140, left: 0, top: 0, right: 140, bottom: 140, x: 0, y: 0, toJSON: () => {} }),
    });

    fireEvent.pointerDown(pad, { clientX: 70, clientY: 70 });
    fireEvent.pointerMove(pad, { clientX: 90, clientY: 80 });

    expect(onLookDelta).toHaveBeenCalled();
    const last = onLookDelta.mock.calls[onLookDelta.mock.calls.length - 1][0];
    expect(Number.isFinite(last.dx)).toBe(true);
  });
});
