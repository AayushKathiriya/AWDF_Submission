import React from 'react';

/**
 * TaskCard — Reusable Card Component
 * CIE Practical: T1 (Component Architecture) & T4 (API Integration + Rendering)
 *
 * Props:
 *   - task: { _id, title, description, priority, status, estimatedHours, assignedTo, project, createdAt }
 *   - onStatusToggle: (id, newStatus) => void
 *   - onDelete: (id) => void
 *   - canModify: boolean
 *
 * Conditional Rendering Requirements:
 *   1. Priority badge color swap (Urgent/High -> Red, Medium -> Amber, Low -> Green)
 *   2. Button swap (Completed -> "Reopen ↺" vs Pending/In Progress -> "Mark Done ✓")
 */
export default function TaskCard({ task, onStatusToggle, onDelete, canModify = true }) {
  const isCompleted = task.status === 'Completed';

  // ── 1. Conditional Rendering: Badge Color Swap ──────────────────────────────
  const getPriorityStyle = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
      case 'high':
        return {
          bg: 'rgba(239, 68, 68, 0.15)',
          color: '#f87171',
          border: '1px solid rgba(239, 68, 68, 0.4)',
        };
      case 'medium':
        return {
          bg: 'rgba(245, 158, 11, 0.15)',
          color: '#fbbf24',
          border: '1px solid rgba(245, 158, 11, 0.4)',
        };
      case 'low':
      default:
        return {
          bg: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          border: '1px solid rgba(16, 185, 129, 0.4)',
        };
    }
  };

  const priorityStyle = getPriorityStyle(task.priority);

  return (
    <article
      style={{
        ...styles.card,
        borderLeft: isCompleted
          ? '4px solid #10b981'
          : `4px solid ${priorityStyle.color}`,
        opacity: isCompleted ? 0.8 : 1,
      }}
    >
      {/* Header with Project Code & Delete Button */}
      <div style={styles.cardHeader}>
        <div style={styles.metaRow}>
          <span style={styles.projectTag}>
            📁 {task.project?.code || 'GEN'}
          </span>
          <span
            style={{
              ...styles.priorityBadge,
              backgroundColor: priorityStyle.bg,
              color: priorityStyle.color,
              border: priorityStyle.border,
            }}
          >
            ● {task.priority}
          </span>
        </div>

        {canModify && onDelete && (
          <button
            onClick={() => onDelete(task._id)}
            style={styles.deleteBtn}
            title="Delete Task"
            aria-label="Delete Task"
          >
            ✕
          </button>
        )}
      </div>

      {/* Task Title */}
      <h3
        style={{
          ...styles.title,
          textDecoration: isCompleted ? 'line-through' : 'none',
        }}
      >
        {task.title}
      </h3>

      {/* Description */}
      <p style={styles.description}>{task.description}</p>

      {/* Populated Relationships Details */}
      <div style={styles.detailsBox}>
        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>Assigned:</span>
          <span style={styles.detailVal}>
            👤 {task.assignedTo?.name || 'Unassigned'}{' '}
            <small style={styles.roleTag}>({task.assignedTo?.role || 'dev'})</small>
          </span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>Project:</span>
          <span style={styles.detailVal}>
            🏢 {task.project?.name || 'Standard'}
          </span>
        </div>
        <div style={styles.detailRow}>
          <span style={styles.detailLabel}>Est. Hours:</span>
          <span style={styles.detailVal}>⏱️ {task.estimatedHours} hrs</span>
        </div>
      </div>

      {/* Footer with Status Badge and Conditional Action Button Swap */}
      <div style={styles.cardFooter}>
        <span
          style={{
            ...styles.statusChip,
            backgroundColor: isCompleted
              ? 'rgba(16, 185, 129, 0.2)'
              : task.status === 'In Progress'
              ? 'rgba(99, 102, 241, 0.2)'
              : 'rgba(148, 163, 184, 0.15)',
            color: isCompleted
              ? '#34d399'
              : task.status === 'In Progress'
              ? '#818cf8'
              : '#94a3b8',
          }}
        >
          {task.status}
        </span>

        {/* ── 2. Conditional Rendering: Button Swap ───────────────────────── */}
        {canModify && onStatusToggle && (
          <button
            onClick={() =>
              onStatusToggle(task._id, isCompleted ? 'Pending' : 'Completed')
            }
            style={isCompleted ? styles.btnReopen : styles.btnComplete}
          >
            {isCompleted ? 'Reopen ↺' : 'Mark Done ✓'}
          </button>
        )}
      </div>
    </article>
  );
}

const styles = {
  card: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '20px',
    boxShadow: 'var(--shadow-card)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  projectTag: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#818cf8',
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    padding: '3px 8px',
    borderRadius: '4px',
    letterSpacing: '0.04em',
  },
  priorityBadge: {
    fontSize: '0.72rem',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-muted)',
    fontSize: '0.9rem',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'color 0.2s',
  },
  title: {
    fontSize: '1.08rem',
    fontWeight: '700',
    color: 'var(--color-text)',
    lineHeight: '1.3',
  },
  description: {
    fontSize: '0.85rem',
    color: 'var(--color-muted)',
    lineHeight: '1.45',
  },
  detailsBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '0.78rem',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  detailLabel: {
    color: 'var(--color-muted)',
  },
  detailVal: {
    color: 'var(--color-text)',
    fontWeight: '500',
  },
  roleTag: {
    color: 'var(--color-muted)',
    fontSize: '0.7rem',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '8px',
    borderTop: '1px solid var(--border-color)',
  },
  statusChip: {
    fontSize: '0.75rem',
    fontWeight: '600',
    padding: '4px 10px',
    borderRadius: '12px',
  },
  btnComplete: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    padding: '6px 14px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnReopen: {
    backgroundColor: 'transparent',
    color: '#f59e0b',
    border: '1px solid #f59e0b',
    padding: '5px 12px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
