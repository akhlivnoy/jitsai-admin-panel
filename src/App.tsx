import { type FormEvent, useState } from 'react';
import './App.css';
import { useAuth } from './auth/AuthProvider';
import { TechniquesPanel } from './features/techniques/TechniquesPanel';

function App() {
  const { session, isAdmin, loading, signIn, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await signIn(email, password);
    if (result.error) setError(result.error);
    setSubmitting(false);
  }

  if (loading) {
    return (
      <main className="page">
        <div className="card center">Loading session...</div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="page">
        <div className="card max-w-md">
          <h1 className="title">Admin sign in</h1>
          <form
            onSubmit={handleLogin}
            className="space-y-3"
          >
            <label className="field">
              <span>Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                required
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </label>
            {error && <p className="error">{error}</p>}
            <button
              type="submit"
              className="primary"
              disabled={submitting}
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="page">
        <div className="card center space-y-3">
          <h1 className="title">Not authorized</h1>
          <p className="muted">Your account does not have admin access.</p>
          <button
            type="button"
            className="secondary"
            onClick={signOut}
          >
            Sign out
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="card">
        <div className="flex-row">
          <div>
            <p className="muted text-sm">Signed in</p>
            <p className="font-semibold">{session.user.email}</p>
          </div>
          <button
            type="button"
            className="secondary"
            onClick={signOut}
          >
            Sign out
          </button>
        </div>
      </div>

      <TechniquesPanel />
    </main>
  );
}

export default App;
