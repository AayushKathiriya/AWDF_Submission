import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        {/* Brand */}
        <Link to="/" style={styles.brand}>
          <div style={styles.logoBadge}>⚡</div>
          <div>
            <span style={styles.brandTitle}>TaskFlow CIE</span>
            <span style={styles.brandSubtitle}>ITUE301 Practical Exam</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav style={styles.nav}>
          <NavLink
            to="/"
            style={({ isActive }) => ({
              ...styles.navLink,
              color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
              borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
            })}
          >
            📊 Dashboard
          </NavLink>

          <NavLink
            to="/tasks/new"
            style={({ isActive }) => ({
              ...styles.navLink,
              color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
              borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
            })}
          >
            ➕ Create Task
          </NavLink>
        </nav>

        {/* Auth status & actions */}
        <div style={styles.authArea}>
          {isAuthenticated ? (
            <div style={styles.userRow}>
              <div style={styles.userChip}>
                <span style={styles.avatar}>👤</span>
                <span style={styles.userName}>{user?.name || user?.email}</span>
                <span style={styles.roleBadge}>{user?.role || 'admin'}</span>
              </div>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" style={styles.loginBtn}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: 'var(--color-surface)',
    borderBottom: '1px solid var(--border-color)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '12px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
  },
  logoBadge: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    fontWeight: 'bold',
  },
  brandTitle: {
    fontSize: '1.15rem',
    fontWeight: '800',
    color: 'var(--color-text)',
    display: 'block',
  },
  brandSubtitle: {
    fontSize: '0.72rem',
    color: 'var(--color-muted)',
    display: 'block',
  },
  nav: {
    display: 'flex',
    gap: '16px',
  },
  navLink: {
    padding: '8px 12px',
    fontSize: '0.88rem',
    fontWeight: '600',
    textDecoration: 'none',
    transition: 'all 0.2s',
  },
  authArea: {
    display: 'flex',
    alignItems: 'center',
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--color-bg)',
    padding: '4px 10px',
    borderRadius: '20px',
    border: '1px solid var(--border-color)',
    fontSize: '0.8rem',
  },
  avatar: {
    fontSize: '0.9rem',
  },
  userName: {
    fontWeight: '600',
    color: 'var(--color-text)',
  },
  roleBadge: {
    fontSize: '0.68rem',
    fontWeight: '700',
    color: '#818cf8',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    padding: '1px 6px',
    borderRadius: '10px',
    textTransform: 'uppercase',
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--color-muted)',
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  loginBtn: {
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    padding: '8px 18px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.85rem',
    fontWeight: '600',
    textDecoration: 'none',
  },
};
