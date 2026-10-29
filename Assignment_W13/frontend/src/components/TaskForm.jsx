import React, { useState } from 'react';

export default function TaskForm({ onAddTask, isAiTheme }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('2026-11-20');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate,
      status: 'Pending',
    });

    setTitle('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3 style={styles.formTitle}>➕ Create New Task</h3>

      <div style={styles.formGroup}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title..."
          required
          style={styles.input}
        />
      </div>

      <div style={styles.formGroup}>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task details and deliverables..."
          style={styles.textarea}
        />
      </div>

      <div style={styles.row}>
        <div style={styles.half}>
          <label style={styles.label}>Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={styles.select}
          >
            <option value="High">🔴 High</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Low">🟢 Low</option>
          </select>
        </div>

        <div style={styles.half}>
          <label style={styles.label}>Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            style={styles.input}
          >
          </input>
        </div>
      </div>

      <button type="submit" style={styles.submitBtn}>
        Create Task
      </button>
    </form>
  );
}

const styles = {
  form: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '20px',
    boxShadow: 'var(--shadow-card)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  },
  formTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: 'var(--color-text)',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--color-muted)',
    marginBottom: '4px',
    textTransform: 'uppercase',
  },
  input: {
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    fontSize: '0.85rem',
    fontFamily: 'inherit',
    outline: 'none',
  },
  textarea: {
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    fontSize: '0.85rem',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'vertical',
  },
  row: {
    display: 'flex',
    gap: '12px',
  },
  half: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  select: {
    padding: '9px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    fontSize: '0.85rem',
    outline: 'none',
  },
  submitBtn: {
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    border: 'none',
    padding: '10px',
    borderRadius: 'var(--radius-sm)',
    fontWeight: '600',
    fontSize: '0.85rem',
    marginTop: '4px',
  },
};
