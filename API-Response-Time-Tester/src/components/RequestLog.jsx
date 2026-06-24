/**
 * RequestLog.jsx
 * Full request-by-request table with latency bars, status badges, method labels.
 */

function statusClass(status) {
  if (!status) return 'status-err';
  if (status >= 500) return 'status-5xx';
  if (status >= 400) return 'status-4xx';
  if (status >= 300) return 'status-3xx';
  return 'status-2xx';
}

function latencyClass(ms) {
  if (ms < 300)  return 'latency-fast';
  if (ms < 800)  return 'latency-medium';
  return 'latency-slow';
}

function latencyBarColor(ms) {
  if (ms < 300)  return '#22d3a5';
  if (ms < 800)  return '#f7c94b';
  return '#ff5a70';
}

export default function RequestLog({ results }) {
  if (!results || results.length === 0) return null;

  // Find max latency for relative bar widths
  const maxLatency = Math.max(...results.map((r) => r.latency), 1);

  return (
    <>
      <h2 className="panel-title">Request Log</h2>
      <div className="log-table-wrapper">
        <table className="log-table" aria-label="Request log table">
          <thead>
            <tr>
              <th>#</th>
              <th>Status</th>
              <th>Latency</th>
              <th>Bar</th>
              <th>Time</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => {
              const barWidth = Math.round((r.latency / maxLatency) * 100);
              const ts = new Date(r.timestamp);
              const timeStr = ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

              return (
                <tr key={r.index} id={`log-row-${r.index}`}>
                  {/* Index */}
                  <td>{r.index}</td>

                  {/* Status badge */}
                  <td>
                    {r.error ? (
                      <span className="status-badge status-err">ERR</span>
                    ) : (
                      <span className={`status-badge ${statusClass(r.status)}`}>
                        {r.status}
                      </span>
                    )}
                  </td>

                  {/* Latency number */}
                  <td className={`latency-cell ${latencyClass(r.latency)}`}>
                    {r.latency} ms
                  </td>

                  {/* Latency bar */}
                  <td>
                    <div className="latency-bar-bg">
                      <div
                        className="latency-bar-fill"
                        style={{
                          width: `${barWidth}%`,
                          background: latencyBarColor(r.latency),
                        }}
                      />
                    </div>
                  </td>

                  {/* Timestamp */}
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{timeStr}</td>

                  {/* Note / error */}
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem' }}>
                    {r.error
                      ? <span style={{ color: 'var(--accent-danger)' }}>{r.error}</span>
                      : r.latency < 300
                      ? '🟢 Fast'
                      : r.latency < 800
                      ? '🟡 OK'
                      : '🔴 Slow'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
