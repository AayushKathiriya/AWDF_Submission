import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';

/**
 * LoginPage — Page Component 3
 * CIE Practical: T1 (3 distinct pages), T2 (Routing & Auth State Management)
 */
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Return to requested protected route if redirected
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@cie.edu');
    setPassword('admin123');
  };

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBadge}>🔐</div>
          <h1 style={styles.title}>Sign In to TaskFlow</h1>
          <p style={styles.subtitle}>
            Enter credentials to access protected routes and task mutations.
          </p>
        </div>

        {error && <Alert type="error" message={error} />}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g., aayush@cie.edu"
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.demoSection}>
          <div style={styles.divider}>
            <span>OR QUICK DEMO</span>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            style={styles.demoBtn}
          >
            ⚡ Auto-Fill Demo Credentials (Admin)
          </button>
          <p style={styles.demoHint}>
            Credentials: <code>demo@cie.edu</code> / <code>admin123</code>
          </p>
        </div>
      </div>
    </main>
  );
}

const styles = {
  container: {
    minHeight: '75vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 20px',
  },
  card: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: '36px 32px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: 'var(--shadow-card)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  logoBadge: {
    width: '48px',
    height: '48px',
    margin: '0 auto 12px',
    borderRadius: '12px',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    color: 'var(--color-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
  },
  title: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: 'var(--color-text)',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: 'var(--color-muted)',
    marginTop: '6px',
    lineHeight: '1.4',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--color-text)',
  },
  input: {
    padding: '12px',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.9rem',
    outline: 'none',
  },
  submitBtn: {
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    fontWeight: '700',
    fontSize: '0.92rem',
    marginTop: '6px',
    cursor: 'pointer',
  },
  demoSection: {
    marginTop: '24px',
    textAlign: 'center',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    color: 'var(--color-muted)',
    fontSize: '0.72rem',
    letterSpacing: '0.05em',
    marginBottom: '16px',
  },
  demoBtn: {
    width: '100%',
    padding: '10px',
    backgroundColor: 'transparent',
    border: '1px dashed var(--color-primary)',
    color: '#818cf8',
    borderRadius: 'var(--radius-sm)',
    fontWeight: '600',
    fontSize: '0.82rem',
    cursor: 'pointer',
  },
  demoHint: {
    marginTop: '8px',
    fontSize: '0.75rem',
    color: 'var(--color-muted)',
  },
};
