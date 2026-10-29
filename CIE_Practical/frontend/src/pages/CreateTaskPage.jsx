import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import TaskCard from '../components/TaskCard';
import { useAuth } from '../context/AuthContext';

/**
 * CreateTaskPage — Page Component 2
 * CIE Practical: T1 (3 distinct pages), T2 (Controlled form reflecting state live), T5 (Schema validation)
 */
export default function CreateTaskPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Controlled form state (T2: Reflects state live)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    estimatedHours: 8,
    project: '',
    assignedTo: '',
    status: 'Pending',
  });

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState([]);

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [projRes, userRes] = await Promise.all([
          fetch('/api/v1/projects'),
          fetch('/api/v1/users'),
        ]);
        const projData = await projRes.json();
        const userData = await userRes.json();

        if (projData.success && projData.data.length > 0) {
          setProjects(projData.data);
          setFormData((prev) => ({ ...prev, project: projData.data[0]._id }));
        }
        if (userData.success && userData.data.length > 0) {
          setUsers(userData.data);
          setFormData((prev) => ({ ...prev, assignedTo: userData.data[0]._id }));
        }
      } catch (err) {
        console.warn('Failed to load dropdowns:', err);
      }
    };
    fetchDropdowns();
  }, []);

  // Generic controlled input handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrorDetails([]);

    try {
      const res = await fetch('/api/v1/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          estimatedHours: Number(formData.estimatedHours),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.message || 'Validation failed.');
        setErrorDetails(json.details || []);
        setLoading(false);
        return;
      }

      // Success (201 Created)
      navigate('/');
    } catch (err) {
      setError(err.message || 'Network error occurred.');
      setLoading(false);
    }
  };

  // Preview object built dynamically from live state
  const selectedProject = projects.find((p) => p._id === formData.project);
  const selectedUser = users.find((u) => u._id === formData.assignedTo);
  const livePreviewTask = {
    _id: 'live-preview-id',
    title: formData.title || 'Task Title Preview',
    description: formData.description || 'Live preview will display your description here...',
    priority: formData.priority,
    status: formData.status,
    estimatedHours: formData.estimatedHours,
    project: selectedProject || { name: 'Selecting...', code: 'NEW' },
    assignedTo: selectedUser || { name: 'Selecting...', role: 'team' },
    createdAt: new Date(),
  };

  return (
    <main style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>Create New Task</h1>
        <p style={styles.pageSubtitle}>
          Controlled form submitting to <code>POST /api/v1/tasks</code> with Mongoose schema validation.
        </p>
      </div>

      {error && <Alert type="error" message={error} details={errorDetails} />}

      <div style={styles.layout}>
        {/* Controlled Form Column */}
        <section style={styles.formCard}>
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Title */}
            <div style={styles.formGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Task Title *</label>
                <span style={styles.counter}>{formData.title.length}/120 (min 3)</span>
              </div>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Implement STRIDE Threat Model"
                required
                style={styles.input}
              />
            </div>

            {/* Description */}
            <div style={styles.formGroup}>
              <div style={styles.labelRow}>
                <label style={styles.label}>Description *</label>
                <span style={styles.counter}>{formData.description.length} chars (min 5)</span>
              </div>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide detailed deliverables, dependencies, or scope..."
                required
                style={styles.textarea}
              />
            </div>

            {/* Priority & Estimated Hours */}
            <div style={styles.row}>
              <div style={styles.half}>
                <label style={styles.label}>Priority (Enum) *</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="Urgent">🔴 Urgent</option>
                  <option value="High">🟠 High</option>
                  <option value="Medium">🟡 Medium</option>
                  <option value="Low">🟢 Low</option>
                </select>
              </div>

              <div style={styles.half}>
                <label style={styles.label}>Estimated Hours (Min 1) *</label>
                <input
                  type="number"
                  name="estimatedHours"
                  value={formData.estimatedHours}
                  onChange={handleChange}
                  min={1}
                  required
                  style={styles.input}
                />
              </div>
            </div>

            {/* Project & Assignee */}
            <div style={styles.row}>
              <div style={styles.half}>
                <label style={styles.label}>Project Reference *</label>
                <select
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  style={styles.select}
                >
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.half}>
                <label style={styles.label}>Assigned User *</label>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  style={styles.select}
                >
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.submitBtn,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Validating & Saving...' : 'Create Task (201 Created)'}
            </button>
          </form>
        </section>

        {/* Live Preview Column (Reflects state live) */}
        <aside style={styles.previewCard}>
          <div style={styles.previewHeader}>
            <span style={styles.previewBadge}>⚡ LIVE PREVIEW</span>
            <span style={styles.previewSub}>Reflects controlled form state live</span>
          </div>

          <TaskCard
            task={livePreviewTask}
            canModify={false}
          />

          <div style={styles.validationNotes}>
            <h4 style={styles.noteTitle}>Mongoose Validation Guardrails:</h4>
            <ul style={styles.noteList}>
              <li>✓ Title: minlength 3, maxlength 120</li>
              <li>✓ Description: minlength 5</li>
              <li>✓ Priority: enum ['Low', 'Medium', 'High', 'Urgent']</li>
              <li>✓ Estimated Hours: min 1</li>
              <li>✓ Populate references: User and Project models</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 20px',
  },
  header: {
    marginBottom: '24px',
  },
  pageTitle: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: 'var(--color-text)',
  },
  pageSubtitle: {
    fontSize: '0.85rem',
    color: 'var(--color-muted)',
    marginTop: '2px',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.2fr) minmax(320px, 1fr)',
    gap: '24px',
    alignItems: 'start',
  },
  formCard: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '24px',
    boxShadow: 'var(--shadow-card)',
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
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--color-text)',
  },
  counter: {
    fontSize: '0.72rem',
    color: 'var(--color-muted)',
  },
  input: {
    padding: '10px 12px',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.88rem',
    outline: 'none',
  },
  textarea: {
    padding: '10px 12px',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.88rem',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  row: {
    display: 'flex',
    gap: '16px',
  },
  half: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  select: {
    padding: '10px 12px',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.88rem',
    outline: 'none',
  },
  submitBtn: {
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    border: 'none',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    fontWeight: '700',
    fontSize: '0.9rem',
    marginTop: '8px',
    cursor: 'pointer',
  },
  previewCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  previewBadge: {
    fontSize: '0.72rem',
    fontWeight: '700',
    color: '#818cf8',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  previewSub: {
    fontSize: '0.75rem',
    color: 'var(--color-muted)',
  },
  validationNotes: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '16px',
  },
  noteTitle: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: 'var(--color-text)',
    marginBottom: '8px',
  },
  noteList: {
    paddingLeft: '20px',
    fontSize: '0.78rem',
    color: 'var(--color-muted)',
    lineHeight: '1.6',
  },
};
