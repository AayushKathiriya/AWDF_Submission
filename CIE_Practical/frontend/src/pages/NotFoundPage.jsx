import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <main style={styles.container}>
      <h1 style={styles.code}>404</h1>
      <h2 style={styles.title}>Page Not Found</h2>
      <p style={styles.desc}>The route you are looking for does not exist in this application.</p>
      <Link to="/" style={styles.btn}>
        ← Return to Dashboard
      </Link>
    </main>
  );
}

const styles = {
  container: {
    minHeight: '70vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '20px',
  },
  code: {
    fontSize: '5rem',
    fontWeight: '900',
    color: 'var(--color-primary)',
    lineHeight: '1',
  },
  title: {
    fontSize: '1.5rem',
    marginTop: '12px',
    color: 'var(--color-text)',
  },
  desc: {
    color: 'var(--color-muted)',
    marginTop: '8px',
    marginBottom: '24px',
  },
  btn: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--border-color)',
    color: 'var(--color-text)',
    padding: '10px 20px',
    borderRadius: 'var(--radius-sm)',
    fontWeight: '600',
    textDecoration: 'none',
  },
};
