import { Link } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider } from './app/providers/AuthProvider';
import { FeatureFlagsProvider } from './app/providers/FeatureFlagsProvider';
import { ProfileProvider } from './app/providers/ProfileProvider';
import SettingsPanel from './app/components/SettingsPanel';
import { SettingsProvider } from './app/providers/SettingsProvider';
import { AppRoutes, routePaths } from './routes';

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <FeatureFlagsProvider>
      <SettingsProvider>
        <AuthProvider>
          <ProfileProvider>
            <div className="app-shell">
              <nav className="app-nav" aria-label="Primary">
                <h1>VirtuBar</h1>
                <p>Phase 0 navigation shell (mocked)</p>
                <ul className="nav-list">
                  <li className="nav-item">
                    <Link to={routePaths.landing}>Landing</Link>
                  </li>
                  <li className="nav-item">
                    <Link to={routePaths.login}>Login</Link>
                  </li>
                  <li className="nav-item">
                    <Link to={routePaths.onboarding}>Onboarding</Link>
                  </li>
                  <li className="nav-item">
                    <Link to={routePaths.rooms}>Rooms</Link>
                  </li>
                  <li className="nav-item">
                    <Link to={routePaths.uiKit}>UI Kit</Link>
                  </li>
                  <li className="nav-item">
                    <Link to={routePaths.bar.replace(':roomId', 'demo-room')}>Enter Bar</Link>
                  </li>
                </ul>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ marginTop: '12px' }}
                  onClick={() => setSettingsOpen(true)}
                >
                  Settings
                </button>
              </nav>
              <main className="app-content">
                <AppRoutes />
              </main>
            </div>
            <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
          </ProfileProvider>
        </AuthProvider>
      </SettingsProvider>
    </FeatureFlagsProvider>
  );
}

export default App;
