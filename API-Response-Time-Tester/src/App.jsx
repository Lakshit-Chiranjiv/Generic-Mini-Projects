import { useState, useRef, useCallback } from 'react';
import InputPanel from './components/InputPanel.jsx';
import StatsGrid from './components/StatsGrid.jsx';
import LatencyChart from './components/LatencyChart.jsx';
import RequestLog from './components/RequestLog.jsx';
import IdleState from './components/IdleState.jsx';

/**
 * Run a single fetch timing probe against a URL.
 * Returns { latency, status, ok, error }.
 */
async function probeOnce(url, method, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const t0 = performance.now();

  try {
    const res = await fetch(url, {
      method,
      signal: controller.signal,
      // no-cors mode would give opaque responses — keep cors so we get status
      mode: 'cors',
      cache: 'no-store',
    });
    const latency = Math.round(performance.now() - t0);
    clearTimeout(timer);
    return { latency, status: res.status, ok: res.ok, error: null };
  } catch (err) {
    const latency = Math.round(performance.now() - t0);
    clearTimeout(timer);
    const isTimeout = err.name === 'AbortError';
    return {
      latency,
      status: null,
      ok: false,
      error: isTimeout ? 'Request timed out' : err.message,
    };
  }
}

/**
 * Compute statistics from an array of result objects.
 */
function computeStats(results) {
  const latencies = results.map((r) => r.latency);
  const successful = results.filter((r) => r.ok);
  const errors = results.filter((r) => r.error);
  const avg = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
  const min = Math.min(...latencies);
  const max = Math.max(...latencies);
  const sorted = [...latencies].sort((a, b) => a - b);
  const p95 = sorted[Math.floor(sorted.length * 0.95)] ?? max;
  const successRate = Math.round((successful.length / results.length) * 100);
  const statuses = results.reduce((acc, r) => {
    const key = r.status ? `${r.status}` : 'ERR';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return { avg, min, max, p95, successRate, total: results.length, errors: errors.length, statuses };
}

export default function App() {
  const [results, setResults]     = useState([]);   // array of probe results
  const [stats, setStats]         = useState(null);
  const [running, setRunning]     = useState(false);
  const [progress, setProgress]   = useState(0);    // 0-100
  const [currentPing, setCurrentPing] = useState(0);
  const [totalPings, setTotalPings]   = useState(0);
  const [testError, setTestError] = useState(null);

  const abortRef = useRef(false);

  const handleRun = useCallback(async ({ url, pingCount, method, delayMs, timeoutMs }) => {
    setRunning(true);
    setResults([]);
    setStats(null);
    setTestError(null);
    setProgress(0);
    setCurrentPing(0);
    setTotalPings(pingCount);
    abortRef.current = false;

    const collected = [];

    for (let i = 0; i < pingCount; i++) {
      if (abortRef.current) break;

      setCurrentPing(i + 1);
      const result = await probeOnce(url, method, timeoutMs);
      const entry = { ...result, index: i + 1, timestamp: new Date().toISOString() };
      collected.push(entry);
      setResults((prev) => [...prev, entry]);
      setProgress(Math.round(((i + 1) / pingCount) * 100));

      if (i < pingCount - 1 && delayMs > 0 && !abortRef.current) {
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }

    if (collected.length > 0) {
      setStats(computeStats(collected));
    }
    setRunning(false);
  }, []);

  const handleStop = useCallback(() => {
    abortRef.current = true;
  }, []);

  const handleReset = useCallback(() => {
    abortRef.current = true;
    setRunning(false);
    setResults([]);
    setStats(null);
    setProgress(0);
    setCurrentPing(0);
    setTotalPings(0);
    setTestError(null);
  }, []);

  const hasResults = results.length > 0;

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-area">
          <span className="logo-icon">⚡</span>
          <div>
            <h1>PingProbe <span className="accent-text">// Tester</span></h1>
            <p className="subtitle">Benchmark any public API endpoint — visualize latency, status codes &amp; trends</p>
          </div>
        </div>
        <div className="header-badge">v1.0.0 · Fetch API</div>
      </header>

      <main className="main-grid">
        {/* Input / Config Panel */}
        <div className="panel fade-in">
          <h2 className="panel-title">Configure &amp; Run</h2>
          <InputPanel
            running={running}
            onRun={handleRun}
            onStop={handleStop}
            onReset={handleReset}
            progress={progress}
            currentPing={currentPing}
            totalPings={totalPings}
            hasResults={hasResults}
          />
        </div>

        {/* Results Area */}
        {!hasResults && !running ? (
          <div className="panel fade-in fade-in-delay-1">
            <IdleState />
          </div>
        ) : (
          <div className="results-wrapper fade-in fade-in-delay-1">
            {/* Stats Grid */}
            {stats && <StatsGrid stats={stats} />}

            {/* Chart */}
            {results.length >= 2 && (
              <div className="panel chart-panel fade-in fade-in-delay-2">
                <LatencyChart results={results} stats={stats} />
              </div>
            )}

            {/* Request Log */}
            {results.length > 0 && (
              <div className="panel log-panel fade-in fade-in-delay-3">
                <RequestLog results={results} />
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Built for developer benchmarking. Powered by <code>Fetch API</code> &amp; <code>Chart.js</code>.</p>
      </footer>
    </div>
  );
}
