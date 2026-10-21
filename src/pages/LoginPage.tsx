import { useActionState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { useAuth } from '../features/auth/authContext';
import { apiConfigured, errorMessage } from '../lib/api';
import { submitKeepingValues } from '../lib/forms';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [error, submit, isPending] = useActionState<string | null, FormData>(async (_prev, form) => {
    try {
      await login(String(form.get('username') ?? ''), String(form.get('password') ?? ''));
      navigate('/memories', { replace: true });
      return null;
    } catch (e) {
      return errorMessage(e);
    }
  }, null);

  if (user) return <Navigate to="/memories" replace />;

  return (
    <main className={styles.page}>
      <form onSubmit={submitKeepingValues(submit)} className={styles.card}>
        <h1>Owner login</h1>
        <p className={styles.hint}>Manage uploads, private photos and deletions.</p>

        {!apiConfigured && (
          <p className={styles.error} role="alert">
            No backend is configured, so login isn&apos;t available.
          </p>
        )}

        <label className={styles.field}>
          <span>Username</span>
          <input name="username" autoComplete="username" required autoCapitalize="none" spellCheck={false} />
        </label>
        <label className={styles.field}>
          <span>Password</span>
          <input name="password" type="password" autoComplete="current-password" required />
        </label>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <button type="submit" className={styles.submit} disabled={isPending || !apiConfigured}>
          {isPending ? 'Signing in…' : 'Sign in'}
        </button>
        <Link to="/memories" className={styles.back}>
          ← Back to Memories
        </Link>
      </form>
    </main>
  );
}
