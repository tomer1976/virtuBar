import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import ErrorBoundary from '../app/components/ErrorBoundary';
import { ErrorNotificationsProvider } from '../app/providers/ErrorNotificationsProvider';

function renderApp(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ErrorNotificationsProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </ErrorNotificationsProvider>
    </MemoryRouter>,
  );
}

describe('End-to-end UI flow', () => {
  it('completes onboarding, joins a room, and performs HUD interactions', async () => {
    const initial = renderApp('/onboarding');

    fireEvent.change(screen.getByLabelText(/Display name/i), { target: { value: 'Demo User' } });
    fireEvent.click(screen.getByLabelText(/Confirm legal age/i));
    fireEvent.click(screen.getByRole('button', { name: /Save & Continue/i }));

    fireEvent.click(screen.getByRole('button', { name: /aurora/i }));
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    const interests = ['Music', 'Karaoke', 'VR', 'Cocktails', 'Live DJ'];
    interests.forEach((label) => fireEvent.click(screen.getByRole('button', { name: label })));
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    fireEvent.click(screen.getByRole('button', { name: /Request mic access/i }));
    fireEvent.click(screen.getByRole('button', { name: /Allow \(mock\)/i }));
    fireEvent.click(screen.getByRole('button', { name: /Mark Audio Ready/i }));
    expect(await screen.findByText(/Audio check saved/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: /Rooms/i }));
    expect(await screen.findByRole('heading', { name: /Rooms/i, level: 2 })).toBeInTheDocument();

    const joinLink = screen.getByRole('link', { name: /Join hottest room/i });
    const joinHref = joinLink.getAttribute('href') ?? '/bar/demo-room';

    initial.unmount();
    renderApp(joinHref);
    expect(await screen.findByRole('heading', { name: /Enter Bar/i, level: 2 })).toBeInTheDocument();

    const chatInput = screen.getByLabelText(/Type a message/i);
    fireEvent.change(chatInput, { target: { value: 'Integration hello' } });
    fireEvent.click(screen.getByRole('button', { name: /Send/i }));
    expect(await screen.findByText('Integration hello')).toBeInTheDocument();

    const firstNearby = await screen.findByTestId('nearby-0');
    fireEvent.click(firstNearby);
    fireEvent.click(screen.getByRole('button', { name: /report user/i }));
    expect(within(firstNearby).getByText(/Reported/i)).toBeInTheDocument();
  });
});