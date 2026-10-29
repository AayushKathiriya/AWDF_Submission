import React, { useState, useEffect } from 'react';
import TaskCard from '../components/TaskCard';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';

/**
 * DashboardPage — Page Component 1
 * CIE Practical: T1 (3 distinct pages), T4 (API Integration & Lifecycle)
 *
 * Implements:
 *   - useEffect fetches on mount
 *   - loading state shown
 *   - error state displayed on failure with retry
 *   - data renders via reusable TaskCard
 *   - client-side search & filter (NO redundant API calls)
 */
export default function DashboardPage() {
  const { token, isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Client-side search and filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Fetch tasks on mount (T4)
  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/tasks');
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Failed to fetch tasks.');
      }

      setTasks(json.data || []);
    } catch (err) {
      setError(err.message || 'Unable to connect to the Task API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Handle status toggle (PATCH /api/v1/tasks/:id/status)
  const handleStatusToggle = async (taskId, newStatus) => {
    if (!isAuthenticated) {
      alert('Please sign in to update task status.');
      return;
    }

    try {
      const res = await fetch(`/api/v1/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      // Optimistically update local task state
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? json.data : t))
      );
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  };

  // Handle task deletion (DELETE /api/v1/tasks/:id)
  const handleDeleteTask = async (taskId) => {
    if (!isAuthenticated) {
      alert('Please sign in to delete tasks.');
      return;
    }

    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const res = await fetch(`/api/v1/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // ── Client-side Filter & Search (T4: No additional API call) ────────────────
  const filteredTasks = tasks.filter((task) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      task.project?.code?.toLowerCase().includes(query) ||
      task.assignedTo?.name?.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === 'All' || task.status === statusFilter;

    const matchesPriority =
      priorityFilter === 'All' || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <main style={styles.container}>
      {/* Top Banner / Stats Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Tasks Dashboard</h1>
          <p style={styles.pageSubtitle}>
            Live Task Management System • ITUE301 Practical
          </p>
        </div>

        <div style={styles.statsRow}>
          <div style={styles.statChip}>
            <span style={styles.statVal}>{tasks.length}</span>
            <span style={styles.statLabel}>Total</span>
          </div>
          <div style={styles.statChip}>
            <span style={{ ...styles.statVal, color: '#f59e0b' }}>
              {tasks.filter((t) => t.status === 'Pending').length}
            </span>
            <span style={styles.statLabel}>Pending</span>
          </div>
          <div style={styles.statChip}>
            <span style={{ ...styles.statVal, color: '#10b981' }}>
              {tasks.filter((t) => t.status === 'Completed').length}
            </span>
            <span style={styles.statLabel}>Completed</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar (Client-Side) */}
      <section style={styles.controlsBar}>
        <div style={styles.searchBox}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title, description, team member..."
            style={styles.searchInput}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={styles.clearSearch}
            >
              ✕
            </button>
          )}
        </div>

        <div style={styles.filterGroup}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.select}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Archived">Archived</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={styles.select}
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </section>

      {/* Error state display with retry button (T4) */}
      {error && (
        <div style={styles.errorBox}>
          <Alert message={`API Error: ${error}`} type="error" />
          <button onClick={fetchTasks} style={styles.retryBtn}>
            ↻ Retry Fetching
          </button>
        </div>
      )}

      {/* Loading state display (T4) */}
      {loading && !error && (
        <div style={styles.loadingArea}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Loading tasks from MongoDB API...</p>
        </div>
      )}

      {/* Tasks Grid or Empty State */}
      {!loading && !error && (
        <>
          {filteredTasks.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📂</div>
              <h3>No tasks match your filter</h3>
              <p style={{ color: 'var(--color-muted)', marginTop: 4 }}>
                Try adjusting your search criteria or create a new task.
              </p>
            </div>
          ) : (
            <div style={styles.grid}>
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onStatusToggle={handleStatusToggle}
                  onDelete={handleDeleteTask}
                  canModify={isAuthenticated}
                />
              ))}
            </div>
          )}
        </>
      )}
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
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
  statsRow: {
    display: 'flex',
    gap: '12px',
  },
  statChip: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statVal: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: 'var(--color-text)',
  },
  statLabel: {
    fontSize: '0.7rem',
    color: 'var(--color-muted)',
    textTransform: 'uppercase',
  },
  controlsBar: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  searchBox: {
    flex: 1,
    minWidth: '280px',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: '0 12px',
  },
  searchIcon: {
    marginRight: '8px',
    fontSize: '0.9rem',
    color: 'var(--color-muted)',
  },
  searchInput: {
    flex: 1,
    padding: '10px 0',
    background: 'none',
    border: 'none',
    color: 'var(--color-text)',
    fontSize: '0.88rem',
    outline: 'none',
  },
  clearSearch: {
    background: 'none',
    border: 'none',
    color: 'var(--color-muted)',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  filterGroup: {
    display: 'flex',
    gap: '8px',
  },
  select: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text)',
    padding: '8px 12px',
    fontSize: '0.85rem',
    outline: 'none',
  },
  errorBox: {
    marginBottom: '24px',
  },
  retryBtn: {
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: 'var(--radius-sm)',
    fontWeight: '600',
    fontSize: '0.85rem',
  },
  loadingArea: {
    padding: '60px 0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255, 255, 255, 0.1)',
    borderTop: '3px solid var(--color-primary)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    color: 'var(--color-muted)',
    fontSize: '0.9rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  emptyState: {
    padding: '60px 20px',
    textAlign: 'center',
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-md)',
    border: '1px dashed var(--border-color)',
  },
  emptyIcon: {
    fontSize: '2.5rem',
    marginBottom: '8px',
  },
};
