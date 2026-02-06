import { Button, Input } from '../ui/components';
import { useAuth } from '../app/providers/AuthProvider';

function LoginPage() {
  const { user, login, logout } = useAuth();

  return (
    <section className="page-card">
      <h2 className="page-title">Login</h2>
      <p className="page-subtitle">Mock login uses deterministic demo identity stored locally.</p>

      <div style={{ display: 'grid', gap: '12px', maxWidth: '320px' }}>
        <label htmlFor="login-email" style={{ display: 'block' }}>
          <span style={{ display: 'block', marginBottom: '8px' }}>Email</span>
          <Input id="login-email" placeholder="demo@virtubar.test" disabled value="demo@virtubar.test" />
        </label>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button onClick={login}>Sign in (mock)</Button>
          <Button variant="ghost" onClick={logout} type="button">
            Sign out
          </Button>
        </div>

        <div className="route-chip" aria-live="polite">
          {user ? `Signed in as ${user.name} (${user.email})` : 'Not signed in'}
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
