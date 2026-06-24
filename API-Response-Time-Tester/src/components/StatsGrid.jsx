/**
 * StatsGrid.jsx
 * Displays 6 summary stat cards after a test run.
 */
export default function StatsGrid({ stats }) {
  if (!stats) return null;

  const { avg, min, max, p95, successRate, total, errors, statuses } = stats;

  // Top status code by occurrence
  const topStatus = Object.entries(statuses).sort((a, b) => b[1] - a[1])[0];
  const topStatusStr = topStatus ? topStatus[0] : '—';

  const cards = [
    {
      id: 'stat-avg',
      label: 'Avg Latency',
      value: avg,
      unit: 'ms',
      icon: '📊',
      variant: getLatencyVariant(avg),
    },
    {
      id: 'stat-min',
      label: 'Min Latency',
      value: min,
      unit: 'ms',
      icon: '🟢',
      variant: 'success',
    },
    {
      id: 'stat-max',
      label: 'Max Latency',
      value: max,
      unit: 'ms',
      icon: '🔴',
      variant: max > 1000 ? 'danger' : 'warn',
    },
    {
      id: 'stat-p95',
      label: 'p95 Latency',
      value: p95,
      unit: 'ms',
      icon: '📈',
      variant: getLatencyVariant(p95),
    },
    {
      id: 'stat-success',
      label: 'Success Rate',
      value: successRate,
      unit: '%',
      icon: '✅',
      variant: successRate === 100 ? 'success' : successRate >= 70 ? 'warn' : 'danger',
    },
    {
      id: 'stat-status',
      label: 'Top Status',
      value: topStatusStr,
      unit: '',
      icon: '🏷️',
      variant: topStatusStr.startsWith('2') ? 'success' : topStatusStr.startsWith('3') ? 'secondary' : 'danger',
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <div key={card.id} id={card.id} className={`stat-card ${card.variant}`}>
          <div className="stat-label">{card.label}</div>
          <div className="stat-value">
            {card.value}
            {card.unit && <span className="stat-unit">{card.unit}</span>}
          </div>
          <span className="stat-icon">{card.icon}</span>
        </div>
      ))}
    </div>
  );
}

function getLatencyVariant(ms) {
  if (ms < 300) return 'success';
  if (ms < 800) return 'warn';
  return 'danger';
}
