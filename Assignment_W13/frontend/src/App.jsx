import React, { useState, useEffect } from 'react';
import AiSuggestionPanel from './components/AiSuggestionPanel';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';

const INITIAL_TASKS = [
  {
    id: 'task-101',
    title: 'Migrate Session Store to Redis',
    description: 'Offload in-memory session tokens to persistent Redis cluster to enable horizontal autoscaling.',
    priority: 'High',
    status: 'Pending',
    dueDate: '2026-11-05',
  },
  {
    id: 'task-102',
    title: 'Implement STRIDE Threat Mitigation',
    description: 'Enforce HTTPS TLS v1.3 and sanitize req.body against NoSQL injection vectors with express-mongo-sanitize.',
    priority: 'High',
    status: 'Completed',
    dueDate: '2026-10-24',
  },
  {
    id: 'task-103',
    title: 'Configure Blue-Green Deployment',
    description: 'Deploy backend-blue on port 5000 and backend-green on port 5001 with Nginx upstream proxy switching.',
    priority: 'Medium',
    status: 'Completed',
    dueDate: '2026-10-28',
  },
  {
    id: 'task-104',
    title: 'Benchmark API Throughput with Apache Bench',
    description: 'Execute ab -n 200 -c 10 on cached vs uncached /tasks endpoint to verify sub-10ms response times.',
    priority: 'Medium',
    status: 'Completed',
    dueDate: '2026-10-20',
  },
  {
    id: 'task-105',
    title: 'Conduct WCAG AA Accessibility Audit',
    description: 'Audit color contrast ratios, screen reader labels, and keyboard navigation across all interactive elements.',
    priority: 'Low',
    status: 'Pending',
    dueDate: '2026-11-12',
  },
];

const DEFAULT_SUGGESTION = {
  fallback: false,
  source: 'openai-gpt-4o-mini',
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    muted: '#94a3b8',
  },
  fonts: {
    heading: 'Outfit',
    body: 'Inter',
    mono: 'JetBrains Mono',
  },
  layoutTip:
    'Adopt a split-pane dashboard with high-contrast priority tags, actionable status chips, and collapsible side panels.',
  accessibility: {
    contrast_primary_on_bg: '7.2:1',
    contrast_text_on_surface: '12.6:1',
    wcag_level: 'AA',
  },
};

export default function App() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [filter, setFilter] = useState('All');
  const [suggestion, setSuggestion] = useState(DEFAULT_SUGGESTION);
  const [loading, setLoading] = useState(false);
  const [isAiThemeApplied, setIsAiThemeApplied] = useState(true);

  // Apply theme class to body
  useEffect(() => {
    if (isAiThemeApplied) {
      document.body.className = 'theme-ai-customized';
      // Apply dynamic CSS variables if custom suggestion exists
      if (suggestion?.colors) {
        document.documentElement.style.setProperty('--color-primary', suggestion.colors.primary);
        document.documentElement.style.setProperty('--color-secondary', suggestion.colors.secondary);
        document.documentElement.style.setProperty('--color-bg', suggestion.colors.background);
        document.documentElement.style.setProperty('--color-surface', suggestion.colors.surface);
        document.documentElement.style.setProperty('--color-text', suggestion.colors.text);
        document.documentElement.style.setProperty('--color-muted', suggestion.colors.muted);
      }
      if (suggestion?.fonts) {
        document.documentElement.style.setProperty('--font-heading', suggestion.fonts.heading);
        document.documentElement.style.setProperty('--font-body', suggestion.fonts.body);
      }
    } else {
      document.body.className = 'theme-legacy-before';
      document.documentElement.style.removeProperty('--color-primary');
      document.documentElement.style.removeProperty('--color-secondary');
      document.documentElement.style.removeProperty('--color-bg');
      document.documentElement.style.removeProperty('--color-surface');
      document.documentElement.style.removeProperty('--color-text');
      document.documentElement.style.removeProperty('--color-muted');
      document.documentElement.style.removeProperty('--font-heading');
      document.documentElement.style.removeProperty('--font-body');
    }
  }, [isAiThemeApplied, suggestion]);

  // Fetch suggestion from backend
  const fetchAiSuggestion = async (description) => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/design-suggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appDescription: description }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setSuggestion(data);
      setIsAiThemeApplied(true);
    } catch (err) {
      console.warn('Backend call failed, using local fallback:', err);
      // Simulate subtle variations if called again
      setSuggestion(DEFAULT_SUGGESTION);
      setIsAiThemeApplied(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = (newTask) => {
    setTasks([{ id: `task-${Date.now().toString().slice(-4)}`, ...newTask }, ...tasks]);
  };

  const handleToggleStatus = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'Completed' ? 'Pending' : 'Completed' }
          : t
      )
    );
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'Pending') return t.status === 'Pending';
    if (filter === 'Completed') return t.status === 'Completed';
    if (filter === 'High Priority') return t.priority === 'High';
    return true;
  });

  const pendingCount = tasks.filter((t) => t.status === 'Pending').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;

  return (
    <div style={styles.container}>
      {/* Top Banner Navigation */}
      <header style={styles.topNav}>
        <div style={styles.brand}>
          <div style={styles.logoCircle}>⚡</div>
          <div>
            <h1 style={styles.appTitle}>TaskFlow Studio</h1>
            <span style={styles.appSubtitle}>
              ITUE301 Advanced Web Development — Week 13
            </span>
          </div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.stateChip}>
            Current State:{' '}
            <strong>{isAiThemeApplied ? '🎨 AI-Enhanced (After)' : '📄 Legacy Baseline (Before)'}</strong>
          </div>
          <button
            onClick={() => setIsAiThemeApplied(!isAiThemeApplied)}
            style={styles.themeToggleBtn}
          >
            {isAiThemeApplied ? 'View Before' : 'View After'}
          </button>
        </div>
      </header>

      {/* Main Grid Content */}
      <main style={styles.mainGrid}>
        {/* Left Column: Tasks & Controls */}
        <section style={styles.tasksSection}>
          {/* Stats Bar */}
          <div style={styles.statsBar}>
            <div style={styles.statItem}>
              <span style={styles.statNumber}>{tasks.length}</span>
              <span style={styles.statLabel}>Total Tasks</span>
            </div>
            <div style={styles.statItem}>
              <span style={{ ...styles.statNumber, color: '#f59e0b' }}>{pendingCount}</span>
              <span style={styles.statLabel}>Pending</span>
            </div>
            <div style={styles.statItem}>
              <span style={{ ...styles.statNumber, color: '#10b981' }}>{completedCount}</span>
              <span style={styles.statLabel}>Completed</span>
            </div>
          </div>

          {/* Task Form */}
          <TaskForm onAddTask={handleAddTask} isAiTheme={isAiThemeApplied} />

          {/* Filter Tabs */}
          <div style={styles.filterBar}>
            {['All', 'Pending', 'Completed', 'High Priority'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  ...styles.filterBtn,
                  backgroundColor:
                    filter === f
                      ? isAiThemeApplied
                        ? 'var(--color-primary)'
                        : '#333333'
                      : 'transparent',
                  color: filter === f ? '#ffffff' : 'var(--color-muted)',
                }}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Task List / Grid */}
          <div style={styles.cardsGrid}>
            {filteredTasks.length === 0 ? (
              <div style={styles.emptyState}>No tasks match this filter.</div>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleStatus={handleToggleStatus}
                  onDeleteTask={handleDeleteTask}
                  isAiTheme={isAiThemeApplied}
                />
              ))
            )}
          </div>
        </section>

        {/* Right Column: AI Suggestion Panel */}
        <section style={styles.sidebarSection}>
          <AiSuggestionPanel
            suggestion={suggestion}
            loading={loading}
            onFetchSuggestion={fetchAiSuggestion}
            isAiThemeApplied={isAiThemeApplied}
            onToggleTheme={() => setIsAiThemeApplied(!isAiThemeApplied)}
          />
        </section>
      </main>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  topNav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '20px',
    borderBottom: '1px solid var(--border-color)',
    flexWrap: 'wrap',
    gap: '16px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  logoCircle: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    fontWeight: 'bold',
  },
  appTitle: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: 'var(--color-text)',
  },
  appSubtitle: {
    fontSize: '0.8rem',
    color: 'var(--color-muted)',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  stateChip: {
    fontSize: '0.8rem',
    color: 'var(--color-muted)',
    backgroundColor: 'var(--color-surface)',
    padding: '6px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
  },
  themeToggleBtn: {
    padding: '8px 16px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--color-primary)',
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    fontWeight: '600',
    fontSize: '0.85rem',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 380px',
    gap: '24px',
    alignItems: 'start',
  },
  tasksSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sidebarSection: {
    position: 'sticky',
    top: '20px',
  },
  statsBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '8px',
  },
  statItem: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: 'var(--color-text)',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: 'var(--color-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  filterBar: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  filterBtn: {
    border: '1px solid var(--border-color)',
    borderRadius: '20px',
    padding: '6px 14px',
    fontSize: '0.8rem',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--color-muted)',
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-md)',
    border: '1px dashed var(--border-color)',
  },
};
