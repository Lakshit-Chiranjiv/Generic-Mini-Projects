# GasGlow - Web3 Gas Price Tracker Dashboard

Live Demo: [web3-gas-price-tracker.vercel.app](https://web3-gas-price-tracker.vercel.app/)

GasGlow is a premium, minimal, and visually stunning Web3 Ethereum Gas Price Tracker Dashboard built 100% in the frontend. It features glassmorphic visual layouts, real-time gas speed splits (Slow, Standard, Fast), interactive historical line charts, custom local threshold alarms, desktop push notifications, and a hybrid mock/live network connection engine.

Designed for both exploration and learning, the app demonstrates how modern Web3 frontends connect to the blockchain, handle API limits with fallbacks, persist user choices locally, and trigger native system notifications.

---

## Tech Stack

Here is the lightweight tech stack used for building this frontend-only application:

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/chart.js-%23FF6384.svg?style=for-the-badge&logo=chartdotjs&logoColor=white)
![Ethereum](https://img.shields.io/badge/ethereum-%233C3C3D.svg?style=for-the-badge&logo=ethereum&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

---

## Core Features

*   **Live Gas Speed Tiers**: Displays current Slow, Standard, and Fast gas rates in Gwei, with estimated transaction completion times and EIP-1559 base fee vs priority tip splits.
*   **Interactive 24h Trend Chart**: Powered by Chart.js with smooth bezier curve graphics and glowing gradients showing historical fluctuations. Automatically updates as new blocks are mined.
*   **Block Countdown Timer**: Auto-polls data every 12 seconds (matching Ethereum's average block time) with a visible animated progress countdown bar.
*   **Smart Threshold Alert System**: Allows users to set a custom Gwei threshold target using a range slider.
*   **Desktop Push Notifications**: Integrates with the HTML5 Web Notification API to send system-level popups immediately when gas prices drop below the user's target threshold (includes a 2-minute cooldown to prevent alert spamming).
*   **Triple-Stream Data Engine**:
    1.  *Simulation Mode (Default)*: Run a high-fidelity mock random-walk simulator offline with Normal, Volatile, and Deep Dip speed controls.
    2.  *Zero-Key Public RPC Fallback*: Fetch actual live mainnet data anonymously from Cloudflare's public Ethereum RPC node without needing any API keys.
    3.  *Live Etherscan Mode*: Provide a free Etherscan API key to fetch Etherscan's full premium Gas Oracle analysis.
*   **Sleek Dark/Light Modes**: Premium custom dark slate variables transitioning to light lavender tokens, including automatic re-coloring of Chart.js grids and tooltips.
*   **LocalStorage Persistence**: Caches user-preferred threshold targets, theme configurations, and API settings so they persist between refreshes.

---

## Project Structure

```text
Web3-Gas-Price-Tracker/
├── index.html          # Semantic HTML5 shell and DOM layouts
├── styles.css          # Design tokens, glassmorphism, dark/light themes, animations
├── app.js              # State manager, simulator, API adapters, Chart.js, Alerts
├── README.md           # This document (Project documentation)
└── docs/               # Technical study and guides folder
    ├── implementation_plan.md
    ├── task.md
    └── walkthrough.md
```

---

*Made for learning Web3 Development. Learn, upgrade, and enjoy tracking.*