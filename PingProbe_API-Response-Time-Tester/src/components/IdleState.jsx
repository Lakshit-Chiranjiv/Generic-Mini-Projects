/**
 * IdleState.jsx
 * Displayed when no test has been run yet.
 */
export default function IdleState() {
  return (
    <div className="idle-state">
      <span className="idle-icon">🌐</span>
      <h3>Ready to Benchmark</h3>
      <p>
        Enter any public API URL above, choose how many pings to fire, and hit <strong>Run Test</strong>.
        You&apos;ll see live latency readings, a trend chart, and a detailed per-request log.
      </p>
      <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', opacity: 0.55 }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          📊 Avg / Min / Max / p95 latency
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          📉 Live latency timeline chart
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          🏷️ Status code tracking per request
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          🔴 Error &amp; timeout detection
        </div>
      </div>
    </div>
  );
}
