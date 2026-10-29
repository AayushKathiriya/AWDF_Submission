import React from 'react';

export default function TaskCard({ task, onToggleStatus, onDeleteTask, isAiTheme }) {
  const isCompleted = task.status === 'Completed';

  // Priority color helper
  const getPriorityBadgeStyle = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return {
          backgroundColor: isAiTheme ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
          color: isAiTheme ? '#f87171' : '#b91c1c',
          border: isAiTheme ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid #fca5a5',
        };
      case 'medium':
        return {
          backgroundColor: isAiTheme ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7',
          color: isAiTheme ? '#fbbf24' : '#b45309',
          border: isAiTheme ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid #fcd34d',
        };
      default:
        return {
          backgroundColor: isAiTheme ? 'rgba(16, 185, 129, 0.2)' : '#d1fae5',
          color: isAiTheme ? '#34d399' : '#047857',
          border: isAiTheme ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid #6ee7b7',
        };
    }
  };

  return (
    <div
      style={{
        ...styles.card,
        borderLeft: isAiTheme ? `4px solid var(--color-primary)` : '1px solid var(--border-color)',
        opacity: isCompleted ? 0.75 : 1,
      }}
    >
      <div style={styles.cardHeader}>
        <div style={styles.badgeGroup}>
          <span
            style={{
              ...styles.badge,
              ...getPriorityBadgeStyle(task.priority),
            }}
          >
            {task.priority || 'Normal'}
          </span>
          <button
            onClick={() => onToggleStatus(task.id)}
            style={{
              ...styles.statusButton,
              backgroundColor: isCompleted
                ? isAiTheme
                  ? 'rgba(16, 185, 129, 0.2)'
                  : '#dcfce7'
                : isAiTheme
                ? 'rgba(99, 102, 241, 0.15)'
                : '#e0e7ff',
              color: isCompleted
                ? isAiTheme
                  ? '#34d399'
                  : '#15803d'
                : isAiTheme
                ? '#818cf8'
                : '#4338ca',
            }}
          >
            {isCompleted ? '✓ Completed' : '○ Pending'}
          </button>
        </div>

        <button
          onClick={() => onDeleteTask(task.id)}
          title="Delete Task"
          style={styles.deleteButton}
        >
          ✕
        </button>
      </div>

      <h3
        style={{
          ...styles.taskTitle,
          textDecoration: isCompleted ? 'line-through' : 'none',
        }}
      >
        {task.title}
      </h3>

      <p style={styles.taskDesc}>{task.description}</p>

      <div style={styles.cardFooter}>
        <span style={styles.dateChip}>
          📅 Due: {task.dueDate || '2026-11-15'}
        </span>
        <span style={styles.idChip}>#{task.id?.slice(0, 8)}</span>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '18px',
    boxShadow: 'var(--shadow-card)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeGroup: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  badge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  statusButton: {
    border: 'none',
    fontSize: '0.75rem',
    fontWeight: '600',
    padding: '3px 10px',
    borderRadius: '12px',
    cursor: 'pointer',
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    color: 'var(--color-muted)',
    fontSize: '0.9rem',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
  },
  taskTitle: {
    fontSize: '1.05rem',
    fontWeight: '600',
    color: 'var(--color-text)',
  },
  taskDesc: {
    fontSize: '0.85rem',
    color: 'var(--color-muted)',
    lineHeight: '1.4',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '8px',
    borderTop: '1px solid var(--border-color)',
    fontSize: '0.75rem',
    color: 'var(--color-muted)',
  },
  dateChip: {
    fontWeight: '500',
  },
  idChip: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
  },
};
