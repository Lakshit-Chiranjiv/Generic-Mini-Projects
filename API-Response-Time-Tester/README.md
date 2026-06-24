# PingProbe - API Response Time Tester

PingProbe is a premium, minimal, and visually stunning API Response Time Tester built with React and Chart.js. It pings any public API endpoint multiple times, captures real-time latency for each request, and presents aggregate statistics (avg, min, max, p95), a live latency timeline chart with color-coded severity points, and a full per-request log table — all in a dark glassmorphic interface.

Designed for developer benchmarking and learning, the app demonstrates how to time browser `fetch` requests with `performance.now()`, handle CORS and network errors gracefully, incrementally update live state as results stream in, and render interactive Chart.js graphs inside React components without any backend.

---

## Tech Stack

Here is the lightweight tech stack used for building this frontend-only application:

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Chart.js](https://img.shields.io/badge/chart.js-%23FF6384.svg?style=for-the-badge&logo=chartdotjs&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-%2343853D.svg?style=for-the-badge&logo=node.dot-js&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

---

## Core Features

*   **Multi-Ping Benchmarking**: Fires 3 to 30 sequential HTTP requests to any CORS-enabled public endpoint. Each ping is timed independently using `performance.now()` for sub-millisecond precision.
*   **Live Streaming Results**: Results appear one by one as each probe completes — you see the table and chart grow in real-time rather than waiting for the full run to finish.
*   **Statistical Summary Cards**: After the run, six stat cards show Average, Min, Max, and p95 latency (percentile 95), overall success rate, and the most frequent HTTP status code.
*   **Interactive Latency Chart**: A Chart.js line chart overlays individual readings with color-coded data points (green/yellow/red), a gradient fill area, and dashed reference lines for average, minimum, and maximum values. Tooltips show full details on hover.
*   **Per-Request Log Table**: Every ping appears as a row with its HTTP status badge (color-coded by 2xx/3xx/4xx/5xx/ERR), numeric latency, a proportional latency bar, timestamp, and a fast/ok/slow tag.
*   **Configurable Test Parameters**: Adjust the HTTP method (GET, POST, PUT, DELETE, PATCH, HEAD), number of pings, delay between requests, and request timeout — all without refreshing.
*   **Error & Timeout Detection**: Catches network failures and abort-signal timeouts, marks them as ERR in the log with the error message, and still includes their elapsed time in statistics.
*   **Quick Presets**: Eight built-in endpoint presets (JSONPlaceholder, GitHub API, Dog CEO, HTTPBin, Catfact, IP-API, Open Library) let you start benchmarking in one click.
*   **Stop & Reset Controls**: Cancel a running test mid-run, or wipe all results and start fresh without reloading the page.

---

## Project Structure

```text
API-Response-Time-Tester/
├── index.html              # Semantic HTML5 entry point with SEO meta tags
├── vite.config.js          # Vite developer server and React plugin configuration
├── package.json            # Project packages configuration and dependencies
├── README.md               # This document (Project documentation)
└── src/                    # Application source folder
    ├── main.jsx            # React root mount
    ├── App.jsx             # Root component — probe logic, state, and layout
    ├── style.css           # Full design system: tokens, glassmorphism, animations
    └── components/
        ├── InputPanel.jsx  # URL input, method/count/delay selectors, presets, progress
        ├── StatsGrid.jsx   # Six summary stat cards (avg, min, max, p95, success, status)
        ├── LatencyChart.jsx # Chart.js Line chart with gradient fill and reference lines
        ├── RequestLog.jsx  # Per-request table with status badges and latency bars
        └── IdleState.jsx   # Empty state shown before first test run
```

---

*Made for developer benchmarking and API exploration. Learn, probe, and enjoy optimizing.*
