import { Link } from 'react-router-dom';
import { AppRoutes, routePaths } from './routes';

function App() {
  return (
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
            <Link to={routePaths.bar.replace(':roomId', 'demo-room')}>Enter Bar</Link>
          </li>
        </ul>
      </nav>
      <main className="app-content">
        <AppRoutes />
      </main>
    </div>
  );
}

export default App;
