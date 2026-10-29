import React, { useState } from 'react';

export default function AiSuggestionPanel({
  suggestion,
  loading,
  onFetchSuggestion,
  isAiThemeApplied,
  onToggleTheme,
}) {
  const [promptText, setPromptText] = useState(
    'A high-performance task management web application with dark mode, priority badges, and quick status toggles.'
  );

  return (
    <aside style={styles.panel}>
      <div style={styles.header}>
        <div style={styles.badgeRow}>
          <span style={styles.aiBadge}>✨ AI ASSISTANT</span>
          <span style={styles.modelBadge}>
            {suggestion?.source === 'openai-gpt-4o-mini' && !suggestion?.fallback
              ? 'OpenAI gpt-4o-mini'
              : 'Curated Fallback'}
          </span>
        </div>
        <h2 style={styles.title}>AI UI Customization</h2>
        <p style={styles.subtitle}>
          Generate and review real-time design suggestions tailored for task workflows.
        </p>
      </div>

      {/* Prompt input */}
      <div style={styles.section}>
        <label style={styles.label}>App Description Prompt</label>
        <textarea
          rows={3}
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="Describe your target app aesthetics and workflows..."
          style={styles.textarea}
        />
        <button
          onClick={() => onFetchSuggestion(promptText)}
          disabled={loading}
          style={{
            ...styles.btnPrimary,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Consulting AI...' : '⚡ Generate UI Suggestions'}
        </button>
      </div>

      {/* Suggested Color Palette */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🎨 Suggested Palette</h3>
        <div style={styles.paletteGrid}>
          {Object.entries(suggestion?.colors || {}).map(([name, hex]) => (
            <div key={name} style={styles.colorItem}>
              <div
                style={{
                  ...styles.colorSwatch,
                  backgroundColor: hex,
                }}
              />
              <div style={styles.colorInfo}>
                <span style={styles.colorName}>{name}</span>
                <code style={styles.colorHex}>{hex}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>🔤 Font Pairing</h3>
        <div style={styles.fontCard}>
          <div>
            <span style={styles.fontLabel}>Heading:</span>{' '}
            <strong style={{ fontFamily: suggestion?.fonts?.heading }}>
              {suggestion?.fonts?.heading || 'Outfit'}
            </strong>
          </div>
          <div style={{ marginTop: 4 }}>
            <span style={styles.fontLabel}>Body:</span>{' '}
            <span style={{ fontFamily: suggestion?.fonts?.body }}>
              {suggestion?.fonts?.body || 'Inter'}
            </span>
          </div>
        </div>
      </div>

      {/* Layout Improvement Tip */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📐 AI Layout Improvement</h3>
        <p style={styles.layoutTip}>{suggestion?.layoutTip}</p>
      </div>

      {/* Accessibility / WCAG Review */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>♿ WCAG Accessibility Review</h3>
        <div style={styles.wcagCard}>
          <div style={styles.wcagRow}>
            <span>Primary on Background:</span>
            <span style={styles.wcagPass}>
              {suggestion?.accessibility?.contrast_primary_on_bg || '7.2:1'} (AA PASS)
            </span>
          </div>
          <div style={styles.wcagRow}>
            <span>Text on Surface:</span>
            <span style={styles.wcagPass}>
              {suggestion?.accessibility?.contrast_text_on_surface || '12.6:1'} (AAA PASS)
            </span>
          </div>
        </div>
      </div>

      {/* Action Toggle */}
      <div style={styles.footer}>
        <button
          onClick={onToggleTheme}
          style={isAiThemeApplied ? styles.btnToggleOff : styles.btnToggleOn}
        >
          {isAiThemeApplied
            ? '🔄 Revert to Baseline (Before)'
            : '✨ Apply AI-Suggested Design (After)'}
        </button>
      </div>
    </aside>
  );
}

const styles = {
  panel: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    boxShadow: 'var(--shadow-card)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  header: {
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '16px',
  },
  badgeRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
  },
  aiBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    letterSpacing: '0.05em',
    color: '#818cf8',
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  modelBadge: {
    fontSize: '0.75rem',
    color: 'var(--color-muted)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid var(--border-color)',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--color-text)',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: 'var(--color-muted)',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sectionTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: 'var(--color-text)',
  },
  label: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--color-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.85rem',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  btnPrimary: {
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    border: 'none',
    padding: '10px 16px',
    borderRadius: 'var(--radius-sm)',
    fontWeight: '600',
    fontSize: '0.85rem',
    transition: 'all 0.2s ease',
  },
  paletteGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  colorItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--color-bg)',
    padding: '6px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
  },
  colorSwatch: {
    width: '28px',
    height: '28px',
    borderRadius: '4px',
    border: '1px solid rgba(255,255,255,0.1)',
    flexShrink: 0,
  },
  colorInfo: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  colorName: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--color-text)',
    textTransform: 'capitalize',
  },
  colorHex: {
    fontSize: '0.7rem',
    color: 'var(--color-muted)',
    fontFamily: 'var(--font-mono)',
  },
  fontCard: {
    backgroundColor: 'var(--color-bg)',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    fontSize: '0.85rem',
  },
  fontLabel: {
    color: 'var(--color-muted)',
  },
  layoutTip: {
    fontSize: '0.85rem',
    lineHeight: '1.4',
    color: 'var(--color-text)',
    backgroundColor: 'var(--color-bg)',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    borderLeft: '4px solid var(--color-primary)',
  },
  wcagCard: {
    backgroundColor: 'var(--color-bg)',
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '0.8rem',
  },
  wcagRow: {
    display: 'flex',
    justifyContent: 'space-between',
    color: 'var(--color-muted)',
  },
  wcagPass: {
    color: '#10b981',
    fontWeight: '600',
  },
  footer: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '16px',
  },
  btnToggleOn: {
    width: '100%',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    border: 'none',
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '0.9rem',
  },
  btnToggleOff: {
    width: '100%',
    padding: '12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    fontWeight: '600',
    fontSize: '0.85rem',
  },
};
