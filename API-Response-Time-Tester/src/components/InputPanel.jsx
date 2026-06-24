import { useState } from 'react';

const PRESETS = [
  { label: 'JSONPlaceholder Posts',  url: 'https://jsonplaceholder.typicode.com/posts/1' },
  { label: 'JSONPlaceholder Users',  url: 'https://jsonplaceholder.typicode.com/users' },
  { label: 'GitHub API (root)',      url: 'https://api.github.com' },
  { label: 'Dog CEO API',            url: 'https://dog.ceo/api/breeds/image/random' },
  { label: 'Open Library',          url: 'https://openlibrary.org/api/books?bibkeys=ISBN:9780140328721&format=json' },
  { label: 'HTTPBin GET',           url: 'https://httpbin.org/get' },
  { label: 'Catfact API',           url: 'https://catfact.ninja/fact' },
  { label: 'IP-API (no-key)',       url: 'https://api.ipify.org?format=json' },
];

const PING_COUNTS = [3, 5, 10, 15, 20, 30];
const DELAY_OPTIONS = [
  { label: 'No delay', value: 0 },
  { label: '100 ms',   value: 100 },
  { label: '250 ms',   value: 250 },
  { label: '500 ms',   value: 500 },
  { label: '1 s',      value: 1000 },
];
const TIMEOUT_OPTIONS = [
  { label: '3 s',  value: 3000 },
  { label: '5 s',  value: 5000 },
  { label: '10 s', value: 10000 },
  { label: '15 s', value: 15000 },
];
const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'];

export default function InputPanel({
  running,
  onRun,
  onStop,
  onReset,
  progress,
  currentPing,
  totalPings,
  hasResults,
}) {
  const [url, setUrl]           = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [pingCount, setPingCount] = useState(10);
  const [method, setMethod]     = useState('GET');
  const [delay, setDelay]       = useState(250);
  const [timeout, setTimeout_]  = useState(5000);

  function handleRun() {
    const trimmed = url.trim();
    if (!trimmed) return;
    onRun({ url: trimmed, pingCount, method, delayMs: delay, timeoutMs: timeout });
  }

  function handlePreset(presetUrl) {
    setUrl(presetUrl);
  }

  const isValid = url.trim().startsWith('http');

  return (
    <div>
      {/* URL Input */}
      <div className="input-section">
        <div className="url-row">
          <div className="url-input-wrapper">
            <span className="url-prefix">🌐</span>
            <input
              id="api-url-input"
              className="url-input"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/endpoint"
              spellCheck={false}
              autoComplete="off"
              disabled={running}
            />
          </div>
          <button
            id="run-test-btn"
            className="btn-primary"
            onClick={handleRun}
            disabled={running || !isValid}
          >
            {running ? (
              <>
                <span className="spinner" />
                Testing…
              </>
            ) : (
              <>⚡ Run Test</>
            )}
          </button>
        </div>

        <p className="cors-note">
          ⚠️ Only CORS-enabled public APIs work directly in the browser.
          APIs that block cross-origin requests will return a network error.
        </p>
      </div>

      {/* Config Row */}
      <div className="config-row">
        <div className="config-field">
          <label htmlFor="ping-count-select">Ping Count</label>
          <select
            id="ping-count-select"
            className="config-select"
            value={pingCount}
            onChange={(e) => setPingCount(Number(e.target.value))}
            disabled={running}
          >
            {PING_COUNTS.map((n) => (
              <option key={n} value={n}>{n} pings</option>
            ))}
          </select>
        </div>

        <div className="config-field">
          <label htmlFor="http-method-select">Method</label>
          <select
            id="http-method-select"
            className="config-select"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            disabled={running}
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="config-field">
          <label htmlFor="delay-select">Delay Between</label>
          <select
            id="delay-select"
            className="config-select"
            value={delay}
            onChange={(e) => setDelay(Number(e.target.value))}
            disabled={running}
          >
            {DELAY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="config-field">
          <label htmlFor="timeout-select">Timeout</label>
          <select
            id="timeout-select"
            className="config-select"
            value={timeout}
            onChange={(e) => setTimeout_(Number(e.target.value))}
            disabled={running}
          >
            {TIMEOUT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Action buttons */}
        <div className="config-field" style={{ marginLeft: 'auto', flexDirection: 'row', gap: '10px', alignItems: 'flex-end' }}>
          {running && (
            <button id="stop-test-btn" className="btn-secondary" onClick={onStop}>
              ⏹ Stop
            </button>
          )}
          {hasResults && !running && (
            <button id="reset-btn" className="btn-secondary" onClick={onReset}>
              ↺ Reset
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {running && (
        <div style={{ marginTop: '18px' }}>
          <div className="progress-bar-wrapper">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-info">
            <span>Ping {currentPing} of {totalPings}</span>
            <span>{progress}% complete</span>
          </div>
        </div>
      )}

      {/* Presets */}
      <div className="presets-area" style={{ marginTop: '22px' }}>
        <div className="presets-label">Quick Presets</div>
        <div className="presets-chips">
          {PRESETS.map((p) => (
            <button
              key={p.url}
              id={`preset-${p.label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
              className="preset-chip"
              onClick={() => handlePreset(p.url)}
              disabled={running}
              title={p.url}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
