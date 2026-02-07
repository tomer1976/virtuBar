import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ErrorBoundary from '../app/components/ErrorBoundary';
import { ErrorNotificationsProvider } from '../app/providers/ErrorNotificationsProvider';
import {
  SETTINGS_STORAGE_KEY,
  SettingsProvider,
  useSettings,
} from '../app/providers/SettingsProvider';

function Thrower(): JSX.Element {
  throw new Error('boom');
}

function SettingsConsumer() {
  useSettings();
  return <div>ok</div>;
}

describe('Error handling', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('shows fallback UI and toast when a child throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorNotificationsProvider>
        <ErrorBoundary>
          <Thrower />
        </ErrorBoundary>
      </ErrorNotificationsProvider>,
    );

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/Reload app/i)).toBeInTheDocument();
    expect(screen.getAllByText(/boom/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Dismiss/i)).toBeInTheDocument();
  });

  it('surfaces storage failures as error toasts', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, '{invalid-json');

    render(
      <ErrorNotificationsProvider>
        <SettingsProvider>
          <SettingsConsumer />
        </SettingsProvider>
      </ErrorNotificationsProvider>,
    );

    expect(await screen.findByText(/Settings data could not be loaded/i)).toBeInTheDocument();
  });
});
