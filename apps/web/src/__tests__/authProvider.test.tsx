import { fireEvent, render, screen } from '@testing-library/react';
import { AuthProvider, AUTH_STORAGE_KEY, mockUser, useAuth } from '../app/providers/AuthProvider';
import { FeatureFlagsProvider } from '../app/providers/FeatureFlagsProvider';

describe('AuthProvider', () => {
  function Wrapper() {
    return (
      <FeatureFlagsProvider>
        <AuthProvider>
          <Consumer />
        </AuthProvider>
      </FeatureFlagsProvider>
    );
  }

  function Consumer() {
    const { user, login, logout } = useAuth();
    return (
      <div>
        <div data-testid="status">{user ? user.email : 'none'}</div>
        <button type="button" onClick={login}>
          login
        </button>
        <button type="button" onClick={logout}>
          logout
        </button>
      </div>
    );
  }

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('logs in with deterministic mock user and persists to localStorage', () => {
    render(<Wrapper />);
    fireEvent.click(screen.getByText(/login/i));
    expect(screen.getByTestId('status').textContent).toContain(mockUser.email);
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toBeTruthy();
  });

  it('hydrates from localStorage on load', () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
    render(<Wrapper />);
    expect(screen.getByTestId('status').textContent).toContain(mockUser.email);
  });

  it('logs out and clears storage', () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
    render(<Wrapper />);
    fireEvent.click(screen.getByText(/logout/i));
    expect(screen.getByTestId('status').textContent).toBe('none');
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });
});
