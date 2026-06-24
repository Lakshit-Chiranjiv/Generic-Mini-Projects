/* ==========================================================================
   GASGLOW MAIN CONTROLLER (app.js)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------------------------
    // 1. STATE MANAGEMENT
    // ----------------------------------------------------------------------
    const state = {
        // Gas data (Gwei)
        currentPrices: {
            slow: 0,
            standard: 0,
            fast: 0,
            baseFee: 0,
            priorityFee: 0
        },
        // Historical logs (Standard Gas Price)
        history: [],
        historyLabels: [],
        
        // App Settings & Preferences
        threshold: parseInt(localStorage.getItem("gas_threshold")) || 30,
        isLiveMode: localStorage.getItem("gas_live_mode") === "true",
        etherscanApiKey: localStorage.getItem("gas_etherscan_key") || "",
        simulationSpeed: localStorage.getItem("gas_sim_speed") || "normal",
        theme: localStorage.getItem("gas_theme") || "dark",
        
        // Timer Mechanics (12-second block intervals)
        countdownMax: 12,
        countdownCurrent: 12,
        pollIntervalId: null,
        clockIntervalId: null,
        
        // Notification State
        lastNotificationTime: 0,
        notificationCooldown: 120000, // 2 minutes in milliseconds
        
        // Latest Mock Block Number
        latestBlock: 17942108,
        
        // Chart Instance
        chartInstance: null
    };

    // ----------------------------------------------------------------------
    // 2. DOM ELEMENT SELECTORS
    // ----------------------------------------------------------------------
    const DOM = {
        // Theme & Header
        themeToggle: document.getElementById("theme-toggle"),
        manualRefresh: document.getElementById("manual-refresh"),
        connectionStatus: document.getElementById("connection-status"),
        statusText: document.getElementById("status-text"),
        latestBlockNum: document.getElementById("latest-block-num"),
        networkLoadVal: document.getElementById("network-load-val"),
        countdownTimer: document.getElementById("countdown-timer"),
        countdownProgress: document.getElementById("countdown-progress"),

        // Gas Price Cards
        priceSlow: document.getElementById("price-slow"),
        priceStandard: document.getElementById("price-standard"),
        priceFast: document.getElementById("price-fast"),
        timeSlow: document.getElementById("time-slow"),
        timeStandard: document.getElementById("time-standard"),
        timeFast: document.getElementById("time-fast"),
        feeSlow: document.getElementById("fee-slow"),
        feeStandard: document.getElementById("fee-standard"),
        feeFast: document.getElementById("fee-fast"),
        cardSlow: document.getElementById("card-slow"),
        cardStandard: document.getElementById("card-standard"),
        cardFast: document.getElementById("card-fast"),

        // Settings / Threshold
        alertStatusBadge: document.getElementById("alert-status-badge"),
        thresholdStatusBox: document.getElementById("threshold-trigger-alert"),
        thresholdStatusMessage: document.getElementById("threshold-status-message"),
        thresholdSlider: document.getElementById("threshold-slider"),
        sliderCurrentVal: document.getElementById("slider-current-val"),
        enableNotifications: document.getElementById("enable-notifications"),

        // API Mode Elements
        liveModeToggle: document.getElementById("live-mode-toggle"),
        apiKeyDrawer: document.getElementById("api-key-drawer"),
        etherscanApiKeyInput: document.getElementById("etherscan-api-key"),
        toggleKeyVisibility: document.getElementById("toggle-key-visibility"),

        // Mock Controls
        mockControlsGroup: document.getElementById("mock-controls-group"),
        speedButtons: document.querySelectorAll(".segment-btn"),

        // Chart & Footer
        lastUpdateTime: document.getElementById("last-update-time"),
        gasTrendIndicator: document.getElementById("gas-trend-indicator")
    };

    // ----------------------------------------------------------------------
    // 3. COLOR HELPER METHOD (Dynamic gradient mappings for Chart.js)
    // ----------------------------------------------------------------------
    function getThemeColors() {
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        return {
            gridLines: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
            text: isDark ? "#9ca3af" : "#4b5563",
            lineColor: isDark ? "#38bdf8" : "#0284c7",
            gradientStart: isDark ? "rgba(56, 189, 248, 0.25)" : "rgba(2, 132, 199, 0.15)",
            gradientStop: "rgba(0, 0, 0, 0)"
        };
    }

    // ----------------------------------------------------------------------
    // 4. CHART.JS VISUALIZER INITIALIZATION
    // ----------------------------------------------------------------------
    function initializeChart() {
        const ctx = document.getElementById("gas-trend-chart").getContext("2d");
        const colors = getThemeColors();
        
        // Generate sleek gradient fills for standard gas line
        const gradient = ctx.createLinearGradient(0, 0, 0, 220);
        gradient.addColorStop(0, colors.gradientStart);
        gradient.addColorStop(1, colors.gradientStop);

        state.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: state.historyLabels,
                datasets: [{
                    label: 'Standard Gas (Gwei)',
                    data: state.history,
                    borderColor: colors.lineColor,
                    borderWidth: 3,
                    pointBackgroundColor: colors.lineColor,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 1.5,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    tension: 0.4,
                    fill: true,
                    backgroundColor: gradient
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        padding: 12,
                        backgroundColor: document.documentElement.getAttribute("data-theme") === "dark" ? "#0f172a" : "#ffffff",
                        titleColor: document.documentElement.getAttribute("data-theme") === "dark" ? "#f3f4f6" : "#1e293b",
                        bodyColor: document.documentElement.getAttribute("data-theme") === "dark" ? "#9ca3af" : "#4b5563",
                        borderColor: 'rgba(99, 102, 241, 0.2)',
                        borderWidth: 1,
                        titleFont: { family: 'Outfit', weight: '700' },
                        bodyFont: { family: 'Inter' },
                        callbacks: {
                            label: function(context) {
                                return ` Gas Price: ${context.parsed.y} Gwei`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: colors.text,
                            font: { family: 'Inter', size: 10 },
                            maxTicksLimit: 8
                        }
                    },
                    y: {
                        grid: { color: colors.gridLines },
                        ticks: {
                            color: colors.text,
                            font: { family: 'Inter', size: 10 },
                            callback: function(value) { return value + ' Gw'; }
                        }
                    }
                }
            }
        });
    }

    // Update chart design on theme changes
    function updateChartTheme() {
        if (!state.chartInstance) return;
        const colors = getThemeColors();
        const ctx = document.getElementById("gas-trend-chart").getContext("2d");
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 220);
        gradient.addColorStop(0, colors.gradientStart);
        gradient.addColorStop(1, colors.gradientStop);

        state.chartInstance.data.datasets[0].borderColor = colors.lineColor;
        state.chartInstance.data.datasets[0].pointBackgroundColor = colors.lineColor;
        state.chartInstance.data.datasets[0].backgroundColor = gradient;
        state.chartInstance.options.scales.x.ticks.color = colors.text;
        state.chartInstance.options.scales.y.ticks.color = colors.text;
        state.chartInstance.options.scales.y.grid.color = colors.gridLines;
        state.chartInstance.options.plugins.tooltip.backgroundColor = document.documentElement.getAttribute("data-theme") === "dark" ? "#0f172a" : "#ffffff";
        state.chartInstance.options.plugins.tooltip.titleColor = document.documentElement.getAttribute("data-theme") === "dark" ? "#f3f4f6" : "#1e293b";
        state.chartInstance.options.plugins.tooltip.bodyColor = document.documentElement.getAttribute("data-theme") === "dark" ? "#9ca3af" : "#4b5563";
        
        state.chartInstance.update();
    }

    // ----------------------------------------------------------------------
    // 5. SEED HISTORICAL LOGS (Prepopulate a 24-point dataset)
    // ----------------------------------------------------------------------
    function seedHistoricalData() {
        let baseValue = 28;
        const timeNow = new Date();
        
        for (let i = 23; i >= 0; i--) {
            const timePast = new Date(timeNow.getTime() - i * 60 * 60 * 1000);
            const hourString = timePast.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Random walk simulation for nice starting curves
            const step = (Math.random() - 0.48) * 6; // slightly positive bias
            baseValue = Math.max(8, Math.min(85, Math.round(baseValue + step)));
            
            state.history.push(baseValue);
            state.historyLabels.push(hourString);
        }
    }

    // ----------------------------------------------------------------------
    // 6. GAS PRICE MOCK SIMULATION ENGINE (Random walk algorithm)
    // ----------------------------------------------------------------------
    function generateSimulatedGasPrices() {
        const lastPrice = state.history[state.history.length - 1] || 25;
        let changeScale = 2; // Normal simulation
        let centerTarget = 26; // Drift core target
        
        if (state.simulationSpeed === "volatile") {
            changeScale = 12; // Volatile shifts
            centerTarget = 40;
        } else if (state.simulationSpeed === "extreme") {
            changeScale = 1.5;
            centerTarget = 12; // Active dipping for threshold tests
        }

        // Apply dynamic random walk
        const probabilityOfReversion = 0.2; // pull prices slightly back to target center
        const drift = (centerTarget - lastPrice) * probabilityOfReversion;
        const randomShift = (Math.random() - 0.5) * changeScale;
        
        let standardPrice = Math.round(lastPrice + drift + randomShift);
        
        // Boundaries checks
        if (state.simulationSpeed === "extreme") {
            standardPrice = Math.max(6, Math.min(22, standardPrice));
        } else {
            standardPrice = Math.max(8, Math.min(120, standardPrice));
        }

        const baseFee = Math.max(4, standardPrice - 1.5);
        const slowPrice = Math.round(baseFee + 0.8);
        const fastPrice = Math.round(baseFee + 3.0);

        return {
            slow: slowPrice,
            standard: standardPrice,
            fast: fastPrice,
            baseFee: baseFee.toFixed(1),
            priorityFee: (standardPrice - baseFee).toFixed(1)
        };
    }

    // ----------------------------------------------------------------------
    // 7. LIVE BLOCKCHAIN API ADAPTERS (Etherscan & Cloudflare JSON-RPC Fallback)
    // ----------------------------------------------------------------------
    
    // Fallback: Query current base Gas price directly from standard public RPC nodes
    async function fetchPublicRpcGas() {
        try {
            const response = await fetch("https://cloudflare-eth.com", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    method: "eth_gasPrice",
                    params: [],
                    id: 1
                })
            });
            
            const data = await response.json();
            if (!data.result) throw new Error("Invalid RPC block response");
            
            // Convert Hex-Wei to decimal Gwei
            const gweiVal = Math.round(parseInt(data.result, 16) / 1000000000);
            
            // Standard block query for latest block height
            const blockResponse = await fetch("https://cloudflare-eth.com", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    method: "eth_blockNumber",
                    params: [],
                    id: 2
                })
            });
            const blockData = await blockResponse.json();
            if (blockData.result) {
                state.latestBlock = parseInt(blockData.result, 16);
            }

            const baseFee = Math.max(1, gweiVal - 1.5);
            return {
                slow: Math.max(1, Math.round(gweiVal * 0.9)),
                standard: gweiVal,
                fast: Math.round(gweiVal * 1.25),
                baseFee: baseFee.toFixed(1),
                priorityFee: (gweiVal - baseFee).toFixed(1),
                source: "Public RPC Fallback"
            };
        } catch (error) {
            console.error("RPC Fallback error:", error);
            throw new Error("Unable to fetch gas from Public RPC.");
        }
    }

    // Primary: Standard Etherscan Gas Tracker API
    async function fetchEtherscanGas() {
        if (!state.etherscanApiKey) {
            // No key provided -> Fallback to RPC node so it still works!
            return await fetchPublicRpcGas();
        }

        const url = `https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=${state.etherscanApiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== "1" || !data.result) {
            throw new Error(data.message || "Etherscan Gas Oracle query rejected");
        }

        const result = data.result;
        
        // Etherscan API returns current block height in GasOracle payload
        if (result.LastBlock) {
            state.latestBlock = parseInt(result.LastBlock);
        }

        const standard = parseInt(result.ProposeGasPrice);
        const slow = parseInt(result.SafeGasPrice);
        const fast = parseInt(result.FastGasPrice);
        const baseFee = parseFloat(result.suggestBaseFee) || (standard - 1.5);
        
        return {
            slow: slow,
            standard: standard,
            fast: fast,
            baseFee: baseFee.toFixed(1),
            priorityFee: (standard - baseFee).toFixed(1),
            source: "Live Etherscan API"
        };
    }

    // Consolidated loader coordinator
    async function getGasPrices() {
        if (!state.isLiveMode) {
            // Mock Simulation Mode
            state.latestBlock += Math.random() > 0.6 ? 1 : 0; // Increment mock blocks
            return generateSimulatedGasPrices();
        }

        try {
            return await fetchEtherscanGas();
        } catch (error) {
            console.warn("Etherscan API failed. Swerving to Public RPC fallback...", error.message);
            try {
                return await fetchPublicRpcGas();
            } catch (rpcErr) {
                console.error("Public RPC fallback failed as well. Falling back to Simulation Mode.", rpcErr.message);
                // Flag visual connection status error
                DOM.connectionStatus.className = "status-pill live-error";
                DOM.statusText.textContent = "API Error (Sim)";
                return generateSimulatedGasPrices();
            }
        }
    }

    // ----------------------------------------------------------------------
    // 8. BROWSER SYSTEM NOTIFICATIONS & TRIGGER LOGIC
    // ----------------------------------------------------------------------
    function setupNotificationsUI() {
        if (!("Notification" in window)) {
            DOM.enableNotifications.style.display = "none";
            DOM.alertStatusBadge.textContent = "Unsupported";
            DOM.thresholdStatusMessage.textContent = "Notifications not supported on this browser.";
            return;
        }

        updateNotificationStatus(Notification.permission);
    }

    function updateNotificationStatus(permission) {
        if (permission === "granted") {
            DOM.enableNotifications.textContent = "Alerts Activated";
            DOM.enableNotifications.className = "action-btn btn-active";
            DOM.alertStatusBadge.className = "badge badge-active";
            DOM.alertStatusBadge.textContent = "Armed";
            
            DOM.thresholdStatusBox.className = "threshold-status-box waiting";
            DOM.thresholdStatusMessage.textContent = `Awaiting standard gas drop below ${state.threshold} Gwei...`;
        } else if (permission === "denied") {
            DOM.enableNotifications.textContent = "Alerts Blocked";
            DOM.enableNotifications.className = "action-btn";
            DOM.enableNotifications.disabled = true;
            DOM.alertStatusBadge.className = "badge badge-inactive";
            DOM.alertStatusBadge.textContent = "Blocked";
            DOM.thresholdStatusBox.className = "threshold-status-box disabled";
            DOM.thresholdStatusMessage.textContent = "Notification access blocked by browser settings.";
        } else {
            DOM.enableNotifications.textContent = "Enable Browser Alerts";
            DOM.enableNotifications.className = "action-btn";
            DOM.alertStatusBadge.className = "badge badge-inactive";
            DOM.alertStatusBadge.textContent = "Inactive";
            DOM.thresholdStatusBox.className = "threshold-status-box disabled";
            DOM.thresholdStatusMessage.textContent = "Click 'Enable Browser Alerts' button to request popup rights.";
        }
    }

    async function requestNotificationPermission() {
        if (!("Notification" in window)) return;
        
        try {
            const permission = await Notification.requestPermission();
            updateNotificationStatus(permission);
            
            if (permission === "granted") {
                // Fire off a small test alert
                new Notification("GasGlow Active!", {
                    body: `Notification pipeline configured. Target alert threshold: ${state.threshold} Gwei.`,
                    icon: "https://ethereum.org/static/a18395d667d26416b10aae97f0fb97a5/34ca9/ethereum-icon-purple.png"
                });
            }
        } catch (error) {
            console.error("Failed to request permission:", error);
        }
    }

    function checkGasThresholdAndNotify(standardPrice) {
        const isBelowThreshold = standardPrice < state.threshold;
        const now = Date.now();
        const cooldownActive = (now - state.lastNotificationTime) < state.notificationCooldown;

        if (isBelowThreshold) {
            // Visual feedback warning system
            DOM.thresholdStatusBox.className = "threshold-status-box triggered";
            DOM.thresholdStatusMessage.textContent = `CRITICAL ALERT: Gas is currently at ${standardPrice} Gwei!`;

            if ("Notification" in window && Notification.permission === "granted") {
                if (!cooldownActive) {
                    new Notification("🚀 Ethereum Gas Low!", {
                        body: `Standard gas dropped to ${standardPrice} Gwei! (Target: ${state.threshold} Gwei). Execute transactions now.`,
                        icon: "https://ethereum.org/static/a18395d667d26416b10aae97f0fb97a5/34ca9/ethereum-icon-purple.png"
                    });
                    state.lastNotificationTime = now;
                } else {
                    console.log(`Gas is low (${standardPrice} Gwei), but alert cooldown is active.`);
                }
            }
        } else {
            if ("Notification" in window && Notification.permission === "granted") {
                DOM.thresholdStatusBox.className = "threshold-status-box waiting";
                DOM.thresholdStatusMessage.textContent = `Awaiting standard gas drop below ${state.threshold} Gwei...`;
            } else {
                DOM.thresholdStatusBox.className = "threshold-status-box disabled";
                DOM.thresholdStatusMessage.textContent = "Set threshold and grant permissions above.";
            }
        }
    }

    // ----------------------------------------------------------------------
    // 9. CORE UI UPDATE ENGINE
    // ----------------------------------------------------------------------
    function updateUIElements(prices) {
        // Simple scale mapping for Network Load display
        let loadPercentage = 42;
        let loadDesc = "Optimal";
        if (prices.standard > 50) {
            loadPercentage = Math.min(99, Math.round(50 + (prices.standard - 50) * 0.8));
            loadDesc = "Heavy Congestion";
        } else if (prices.standard > 30) {
            loadPercentage = Math.round(30 + (prices.standard - 30) * 0.7);
            loadDesc = "Moderate";
        } else {
            loadPercentage = Math.max(12, Math.round(prices.standard * 1.2));
        }
        
        DOM.networkLoadVal.textContent = `${loadPercentage}% (${loadDesc})`;
        DOM.latestBlockNum.textContent = `#${state.latestBlock.toLocaleString()}`;

        // Prices Values
        DOM.priceSlow.textContent = prices.slow;
        DOM.priceStandard.textContent = prices.standard;
        DOM.priceFast.textContent = prices.fast;

        // EIP-1559 detail metrics
        DOM.feeSlow.textContent = `Base: ${prices.baseFee} | Tip: 0.8`;
        DOM.feeStandard.textContent = `Base: ${prices.baseFee} | Tip: ${prices.priorityFee}`;
        DOM.feeFast.textContent = `Base: ${prices.baseFee} | Tip: 3.0`;

        // Confirmation Speed Estimates
        DOM.timeSlow.textContent = prices.slow <= 12 ? "~8 mins" : "~5 mins";
        DOM.timeStandard.textContent = prices.standard <= 15 ? "~3 mins" : "~2 mins";
        DOM.timeFast.textContent = "~15 secs";

        // Connection Status Banner Styling
        if (state.isLiveMode) {
            DOM.connectionStatus.className = "status-pill live-active";
            DOM.statusText.textContent = prices.source || "Live Mainnet";
        } else {
            DOM.connectionStatus.className = "status-pill simulator-active";
            DOM.statusText.textContent = `Sim: ${state.simulationSpeed.toUpperCase()}`;
        }

        // Updated time stamping
        const stamp = new Date();
        DOM.lastUpdateTime.textContent = stamp.toLocaleTimeString();

        // 24 Hour Historical Trend Math checks
        const prevPrice = state.history[state.history.length - 2] || prices.standard;
        const diff = prices.standard - prevPrice;
        
        if (diff > 2) {
            DOM.gasTrendIndicator.className = "trend-direction up";
            DOM.gasTrendIndicator.innerHTML = '<i class="fa-solid fa-arrow-trend-up"></i> Congested';
        } else if (diff < -2) {
            DOM.gasTrendIndicator.className = "trend-direction down";
            DOM.gasTrendIndicator.innerHTML = '<i class="fa-solid fa-arrow-trend-down"></i> Dipping';
        } else {
            DOM.gasTrendIndicator.className = "trend-direction stable";
            DOM.gasTrendIndicator.innerHTML = '<i class="fa-solid fa-minus"></i> Stable';
        }

        // Add subtle scale bump animation to changed cards
        triggerCardPing(DOM.cardSlow);
        triggerCardPing(DOM.cardStandard);
        triggerCardPing(DOM.cardFast);
    }

    function triggerCardPing(element) {
        element.style.transform = "scale(1.025)";
        setTimeout(() => {
            element.style.transform = "";
        }, 200);
    }

    // ----------------------------------------------------------------------
    // 10. POLLING SCHEDULE AND TIMER LOGIC
    // ----------------------------------------------------------------------
    async function triggerGasLifecycleTick() {
        DOM.manualRefresh.querySelector("i").classList.add("spin");
        
        try {
            const prices = await getGasPrices();
            state.currentPrices = prices;
            
            // Push values into trend lines
            state.history.push(prices.standard);
            state.history.shift(); // remove oldest point
            
            const nowString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            state.historyLabels.push(nowString);
            state.historyLabels.shift();

            // Refresh DOM Elements
            updateUIElements(prices);
            
            // Refresh Chart View
            if (state.chartInstance) {
                state.chartInstance.update();
            }

            // Alert validation
            checkGasThresholdAndNotify(prices.standard);

        } catch (err) {
            console.error("General Gas Tick Error:", err);
        } finally {
            setTimeout(() => {
                DOM.manualRefresh.querySelector("i").classList.remove("spin");
            }, 600);
        }
    }

    function startTimerLoop() {
        // Reset countdown clock
        state.countdownCurrent = state.countdownMax;
        updateCountdownBar();

        if (state.pollIntervalId) clearInterval(state.pollIntervalId);
        if (state.clockIntervalId) clearInterval(state.clockIntervalId);

        // Core Poll Trigger (Run immediately on start)
        triggerGasLifecycleTick();

        // 1-second countdown clock logic
        state.clockIntervalId = setInterval(() => {
            state.countdownCurrent--;
            
            if (state.countdownCurrent < 0) {
                state.countdownCurrent = state.countdownMax;
                triggerGasLifecycleTick();
            }
            
            DOM.countdownTimer.textContent = `${state.countdownCurrent}s`;
            updateCountdownBar();
        }, 1000);
    }

    function updateCountdownBar() {
        const percent = (state.countdownCurrent / state.countdownMax) * 100;
        DOM.countdownProgress.style.width = `${percent}%`;
    }

    // ----------------------------------------------------------------------
    // 11. BROWSER EVENT LISTENERS
    // ----------------------------------------------------------------------
    function setupEventHandlers() {
        // Theme Switcher Button
        DOM.themeToggle.addEventListener("click", () => {
            const currentTheme = document.documentElement.getAttribute("data-theme");
            const targetTheme = currentTheme === "dark" ? "light" : "dark";
            
            document.documentElement.setAttribute("data-theme", targetTheme);
            localStorage.setItem("gas_theme", targetTheme);
            
            const icon = DOM.themeToggle.querySelector("i");
            if (targetTheme === "light") {
                icon.className = "fa-solid fa-sun";
            } else {
                icon.className = "fa-solid fa-moon";
            }
            
            updateChartTheme();
        });

        // Manual Force Refresh
        DOM.manualRefresh.addEventListener("click", () => {
            startTimerLoop();
        });

        // Threshold Slider Inputs
        DOM.thresholdSlider.addEventListener("input", (e) => {
            const val = parseInt(e.target.value);
            state.threshold = val;
            DOM.sliderCurrentVal.textContent = `Target: ${val} Gwei`;
            
            // Persist setting
            localStorage.setItem("gas_threshold", val);
            
            if ("Notification" in window && Notification.permission === "granted") {
                DOM.thresholdStatusMessage.textContent = `Awaiting standard gas drop below ${val} Gwei...`;
            }
            
            // Check immediately on shift
            checkGasThresholdAndNotify(state.currentPrices.standard);
        });

        // Trigger Notification authorization click
        DOM.enableNotifications.addEventListener("click", () => {
            requestNotificationPermission();
        });

        // Live Toggle Swinger checkbox
        DOM.liveModeToggle.addEventListener("change", (e) => {
            const isChecked = e.target.checked;
            state.isLiveMode = isChecked;
            localStorage.setItem("gas_live_mode", isChecked);

            if (isChecked) {
                DOM.apiKeyDrawer.className = "drawer expanded";
                DOM.mockControlsGroup.style.opacity = "0.3";
                DOM.mockControlsGroup.style.pointerEvents = "none";
            } else {
                DOM.apiKeyDrawer.className = "drawer collapsed";
                DOM.mockControlsGroup.style.opacity = "1";
                DOM.mockControlsGroup.style.pointerEvents = "auto";
            }

            // Instantly trigger countdown refresh for new network feeds
            startTimerLoop();
        });

        // API Password Key Inputs
        DOM.etherscanApiKeyInput.addEventListener("input", (e) => {
            const keyVal = e.target.value.trim();
            state.etherscanApiKey = keyVal;
            localStorage.setItem("gas_etherscan_key", keyVal);
        });

        // Etherscan key visibility mask/unmask
        DOM.toggleKeyVisibility.addEventListener("click", () => {
            const isPassword = DOM.etherscanApiKeyInput.type === "password";
            DOM.etherscanApiKeyInput.type = isPassword ? "text" : "password";
            
            const icon = DOM.toggleKeyVisibility.querySelector("i");
            icon.className = isPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
        });

        // Simulator Volatility Speed buttons
        DOM.speedButtons.forEach(btn => {
            btn.addEventListener("click", (e) => {
                DOM.speedButtons.forEach(b => b.classList.remove("active"));
                e.target.classList.add("active");

                const speed = e.target.dataset.speed;
                state.simulationSpeed = speed;
                localStorage.setItem("gas_sim_speed", speed);

                // Run immediately for instant speed shifts
                triggerGasLifecycleTick();
            });
        });
    }

    // ----------------------------------------------------------------------
    // 12. INITIALIZATION / LOAD COORDINATOR
    // ----------------------------------------------------------------------
    function init() {
        // Set values matching persisted state
        DOM.thresholdSlider.value = state.threshold;
        DOM.sliderCurrentVal.textContent = `Target: ${state.threshold} Gwei`;
        
        DOM.liveModeToggle.checked = state.isLiveMode;
        DOM.etherscanApiKeyInput.value = state.etherscanApiKey;

        // Apply dark/light theme state
        document.documentElement.setAttribute("data-theme", state.theme);
        const icon = DOM.themeToggle.querySelector("i");
        icon.className = state.theme === "light" ? "fa-solid fa-sun" : "fa-solid fa-moon";

        if (state.isLiveMode) {
            DOM.apiKeyDrawer.className = "drawer expanded";
            DOM.mockControlsGroup.style.opacity = "0.3";
            DOM.mockControlsGroup.style.pointerEvents = "none";
        } else {
            DOM.apiKeyDrawer.className = "drawer collapsed";
            DOM.mockControlsGroup.style.opacity = "1";
            DOM.mockControlsGroup.style.pointerEvents = "auto";
        }

        // Select the active simulation speed button
        DOM.speedButtons.forEach(btn => {
            if (btn.dataset.speed === state.simulationSpeed) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });

        // Run seed data structures
        seedHistoricalData();
        
        // Build the visual chart
        initializeChart();

        // Register action triggers
        setupEventHandlers();
        
        // Setup push pipeline
        setupNotificationsUI();

        // Boot Timer loops
        startTimerLoop();
    }

    // Launch!
    init();
});
