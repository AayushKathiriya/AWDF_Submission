import React from 'react';

export default function Alert({ type = 'error', message, details }) {
  if (!message) return null;

  const isError = type === 'error';

  return (
    <div
      style={{
        ...styles.alert,
        backgroundColor: isError ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
        borderColor: isError ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)',
        color: isError ? '#f87171' : '#34d399',
      }}
    >
      <div style={styles.header}>
        <span style={styles.icon}>{isError ? '⚠️' : '✓'}</span>
        <span style={styles.message}>{message}</span>
      </div>
      {details && details.length > 0 && (
        <ul style={styles.list}>
          {details.map((d, i) => (
            <li key={i} style={styles.item}>{d}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles = {
  alert: {
    border: '1px solid',
    borderRadius: 'var(--radius-sm)',
    padding: '12px 16px',
    marginBottom: '16px',
    fontSize: '0.85rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
  },
  icon: {
    fontSize: '1rem',
  },
  message: {
    flex: 1,
  },
  list: {
    marginTop: '6px',
    paddingLeft: '24px',
    fontSize: '0.8rem',
  },
  item: {
    marginTop: '2px',
  },
};
