import { render, screen } from '@testing-library/react';
import JoystickOverlay from '../ui/components/JoystickOverlay';

describe('JoystickOverlay', () => {
  it('shows controls when visible', () => {
    render(<JoystickOverlay visible invertYAxis={false} />);
    expect(screen.getByLabelText(/Mobile controls HUD/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Move pad/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Look pad/i)).toBeInTheDocument();
  });

  it('hides when not visible', () => {
    const { container } = render(<JoystickOverlay visible={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows invert badge when enabled', () => {
    render(<JoystickOverlay visible invertYAxis />);
    expect(screen.getByText(/Invert Y/i)).toBeInTheDocument();
  });
});
