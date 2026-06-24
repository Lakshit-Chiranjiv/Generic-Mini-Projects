import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

/**
 * Returns a Chart.js color based on latency threshold.
 */
function pointColor(latency) {
  if (latency < 300)  return '#22d3a5';
  if (latency < 800)  return '#f7c94b';
  return '#ff5a70';
}

export default function LatencyChart({ results, stats }) {
  if (!results || results.length < 2) return null;

  const labels   = results.map((r) => `#${r.index}`);
  const latencies = results.map((r) => r.latency);
  const pointColors = latencies.map(pointColor);

  // Gradient fill — built from a canvas plugin
  const gradientPlugin = {
    id: 'customCanvasGradient',
    beforeDatasetsDraw(chart) {
      const { ctx, chartArea: { top, bottom } } = chart;
      const gradient = ctx.createLinearGradient(0, top, 0, bottom);
      gradient.addColorStop(0,   'rgba(108, 99, 255, 0.35)');
      gradient.addColorStop(0.6, 'rgba(108, 99, 255, 0.06)');
      gradient.addColorStop(1,   'rgba(108, 99, 255, 0)');
      chart.data.datasets[0].backgroundColor = gradient;
      // avg line fill
      chart.data.datasets[2].backgroundColor = 'rgba(247,201,75,0.08)';
    },
  };

  // Reference lines for avg, min, max as dataset overlays
  const avgLine = Array(latencies.length).fill(stats?.avg ?? 0);

  const data = {
    labels,
    datasets: [
      {
        label: 'Latency (ms)',
        data: latencies,
        borderColor: '#6c63ff',
        backgroundColor: 'rgba(108,99,255,0.25)', // overridden by plugin
        borderWidth: 2.5,
        pointBackgroundColor: pointColors,
        pointBorderColor: pointColors,
        pointRadius: 5,
        pointHoverRadius: 8,
        tension: 0.38,
        fill: true,
      },
      {
        label: 'Min',
        data: Array(latencies.length).fill(stats?.min ?? 0),
        borderColor: 'rgba(34,211,165,0.5)',
        borderWidth: 1.5,
        borderDash: [6, 4],
        pointRadius: 0,
        fill: false,
        tension: 0,
      },
      {
        label: 'Avg',
        data: avgLine,
        borderColor: 'rgba(247,201,75,0.7)',
        backgroundColor: 'rgba(247,201,75,0.05)',
        borderWidth: 1.5,
        borderDash: [6, 4],
        pointRadius: 0,
        fill: false,
        tension: 0,
      },
      {
        label: 'Max',
        data: Array(latencies.length).fill(stats?.max ?? 0),
        borderColor: 'rgba(255,90,112,0.5)',
        borderWidth: 1.5,
        borderDash: [6, 4],
        pointRadius: 0,
        fill: false,
        tension: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#8a93b8',
          font: { family: 'Inter', size: 11 },
          boxWidth: 12,
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(13,17,34,0.95)',
        borderColor: 'rgba(108,99,255,0.35)',
        borderWidth: 1,
        titleColor: '#eaf0ff',
        bodyColor: '#8a93b8',
        padding: 12,
        titleFont: { family: 'JetBrains Mono', size: 12 },
        bodyFont:  { family: 'JetBrains Mono', size: 11 },
        callbacks: {
          label(ctx) {
            if (ctx.datasetIndex === 0) {
              const ms = ctx.parsed.y;
              const tag = ms < 300 ? '🟢 Fast' : ms < 800 ? '🟡 OK' : '🔴 Slow';
              return `  ${ctx.dataset.label}: ${ms} ms  ${tag}`;
            }
            return `  ${ctx.dataset.label}: ${ctx.parsed.y} ms`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: '#4a5278',
          font: { family: 'JetBrains Mono', size: 10 },
        },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.06)' },
        ticks: {
          color: '#4a5278',
          font: { family: 'JetBrains Mono', size: 10 },
          callback: (v) => `${v} ms`,
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <>
      <div className="chart-header">
        <span className="chart-title">
          📉 Latency Timeline
        </span>
        <div className="chart-legend">
          <span className="legend-item">
            <span className="legend-dot" style={{ background: '#22d3a5' }} />
            Fast (&lt;300ms)
          </span>
          <span className="legend-item">
            <span className="legend-dot" style={{ background: '#f7c94b' }} />
            OK (&lt;800ms)
          </span>
          <span className="legend-item">
            <span className="legend-dot" style={{ background: '#ff5a70' }} />
            Slow (≥800ms)
          </span>
        </div>
      </div>
      <div className="chart-container">
        <Line data={data} options={options} plugins={[gradientPlugin]} />
      </div>
    </>
  );
}
