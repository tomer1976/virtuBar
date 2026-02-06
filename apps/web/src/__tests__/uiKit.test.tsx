import { fireEvent, render, screen } from '@testing-library/react';
import UiKitPage from '../pages/UiKitPage';

function renderPage() {
  return render(<UiKitPage />);
}

describe('UI Kit page', () => {
  it('renders core components', () => {
    renderPage();
    expect(screen.getByText(/UI Kit/i)).toBeInTheDocument();
    expect(screen.getByText(/Informational toast/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Input/i)).toBeInTheDocument();
    expect(screen.getByText(/Ada Lovelace/i)).toBeInTheDocument();
    expect(screen.getByText(/House/i)).toBeInTheDocument();
  });

  it('opens and closes modal', () => {
    renderPage();
    fireEvent.click(screen.getByText(/Open Modal/i));
    expect(screen.getByText(/Example Modal/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Close/i));
    expect(screen.queryByText(/Example Modal/i)).not.toBeInTheDocument();
  });

  it('opens and closes drawer', () => {
    renderPage();
    fireEvent.click(screen.getByText(/Open Drawer/i));
    expect(screen.getByText(/Example Drawer/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Close/i));
    expect(screen.queryByText(/Example Drawer/i)).not.toBeInTheDocument();
  });

  it('removes tag chip when clicked', () => {
    renderPage();
    fireEvent.click(screen.getByLabelText(/Remove House/i));
    expect(screen.queryByText(/House/i)).not.toBeInTheDocument();
  });
});
