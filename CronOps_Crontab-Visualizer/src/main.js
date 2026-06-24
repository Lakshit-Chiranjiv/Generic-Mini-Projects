import cronstrue from 'cronstrue';
import parser from 'cron-parser';

// DOM Element Selections
const cronInput = document.getElementById('cron-input');
const clearBtn = document.getElementById('clear-btn');
const fgMin = document.getElementById('fg-min');
const fgHour = document.getElementById('fg-hour');
const fgDay = document.getElementById('fg-day');
const fgMonth = document.getElementById('fg-month');
const fgWeekday = document.getElementById('fg-weekday');

const resultCard = document.getElementById('result-card');
const errorCard = document.getElementById('error-card');
const cronExplanation = document.getElementById('cron-explanation');
const errorMessage = document.getElementById('error-message');

const tzSelect = document.getElementById('tz-select');
const executionsList = document.getElementById('executions-list');
const copyBtn = document.getElementById('copy-btn');
const presetBadges = document.querySelectorAll('.preset-badge');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  updateUI();
  setupEventListeners();
});

// Event Listeners Configuration
function setupEventListeners() {
  // Live Input translation on keyup & input
  cronInput.addEventListener('input', () => {
    updateUI();
    highlightField();
  });

  // Clear Input field
  clearBtn.addEventListener('click', () => {
    cronInput.value = '';
    cronInput.focus();
    updateUI();
  });

  // Track cursor position to highlight currently focused field
  cronInput.addEventListener('click', highlightField);
  cronInput.addEventListener('keyup', highlightField);
  cronInput.addEventListener('focus', highlightField);
  cronInput.addEventListener('blur', removeHighlights);

  // Timezone switch
  tzSelect.addEventListener('change', updateUI);

  // Copy Explanation text
  copyBtn.addEventListener('click', handleCopy);

  // Presets Quick-Select
  presetBadges.forEach(badge => {
    badge.addEventListener('click', () => {
      cronInput.value = badge.getAttribute('data-cron');
      updateUI();
      cronInput.focus();
    });
  });
}

// Update the entire UI elements based on current input state
function updateUI() {
  const rawExpression = cronInput.value;
  const cronExpression = rawExpression.trim();

  // If input is empty, show a neutral state
  if (!cronExpression) {
    showEmptyState();
    updateFieldGuide('-', '-', '-', '-', '-');
    return;
  }

  // Update visual guide with parts
  const parts = cronExpression.split(/\s+/);
  
  if (cronExpression.startsWith('@')) {
    // If it's a predefined nickname alias (e.g. @daily, @hourly)
    updateFieldGuide('—', '—', '—', '—', '—');
  } else {
    // Handle standard mapping
    if (parts.length === 6) {
      // Typically: seconds, minutes, hours, day of month, month, day of week
      // We map the 5 middle/last parts to our guide for simplicity
      updateFieldGuide(parts[1] || '*', parts[2] || '*', parts[3] || '*', parts[4] || '*', parts[5] || '*');
    } else {
      // Typically: minutes, hours, day of month, month, day of week
      updateFieldGuide(parts[0] || '*', parts[1] || '*', parts[2] || '*', parts[3] || '*', parts[4] || '*');
    }
  }

  try {
    // 1. Translate Cron into human-readable description
    // Set throwExceptionOnParseError: true to let us catch errors cleanly
    const explanation = cronstrue.toString(cronExpression, { throwExceptionOnParseError: true });
    
    // 2. Parse execution dates using cron-parser
    const useUTC = tzSelect.value === 'utc';
    const parseOptions = {
      currentDate: new Date(),
      tz: useUTC ? 'UTC' : undefined
    };

    const interval = parser.parseExpression(cronExpression, parseOptions);
    const executions = [];

    // Retrieve next 10 schedules
    for (let i = 0; i < 10; i++) {
      executions.push(interval.next().toDate());
    }

    // Toggle cards: show result and hide error
    resultCard.classList.remove('hidden');
    errorCard.classList.add('hidden');
    
    cronExplanation.textContent = explanation;
    
    // Display calculations
    displayExecutions(executions, useUTC);

  } catch (err) {
    // Show error card and hide result
    resultCard.classList.add('hidden');
    errorCard.classList.remove('hidden');
    errorMessage.textContent = err.message || 'Syntax Error: Check expression fields spacing.';
    executionsList.innerHTML = `<li class="run-item" style="grid-template-columns: 1fr; text-align: center; color: var(--text-muted); font-size: 0.9rem;">Waiting for valid cron expression to schedule...</li>`;
  }
}

// Display Next Executions List
function displayExecutions(dates, useUTC) {
  executionsList.innerHTML = '';
  
  dates.forEach((date, index) => {
    const li = document.createElement('li');
    li.className = 'run-item';
    
    // Add border highlighting to the very next run
    if (index === 0) {
      li.classList.add('nearest');
    }

    // Index formatting (#1 to #10)
    const indexSpan = document.createElement('span');
    indexSpan.className = 'run-index';
    indexSpan.textContent = `#${index + 1}`;

    // Timestamp formatting
    const timestampSpan = document.createElement('span');
    timestampSpan.className = 'run-timestamp';
    
    if (useUTC) {
      // Format as: 2026-05-19 12:00:00 UTC
      const iso = date.toISOString();
      timestampSpan.textContent = iso.replace('T', ' ').substring(0, 19) + ' UTC';
    } else {
      // Local time formatting
      timestampSpan.textContent = date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    }

    // Relative Time Indicator (e.g. "in 3 hrs")
    const relativeSpan = document.createElement('span');
    relativeSpan.className = 'run-relative';
    relativeSpan.textContent = index === 0 ? `next run: ${getRelativeTimeString(date)}` : getRelativeTimeString(date);

    li.appendChild(indexSpan);
    li.appendChild(timestampSpan);
    li.appendChild(relativeSpan);
    
    executionsList.appendChild(li);
  });
}

// Custom Date-Math helper for calculating relative time descriptions
function getRelativeTimeString(targetDate) {
  const diffMs = targetDate.getTime() - Date.now();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (diffMs < 0) {
    return 'just now';
  }

  if (diffMins < 1) {
    return 'in less than a minute';
  } else if (diffMins < 60) {
    return `in ${diffMins} min${diffMins > 1 ? 's' : ''}`;
  } else if (diffHours < 24) {
    return `in ${diffHours} hr${diffHours > 1 ? 's' : ''}`;
  } else {
    return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  }
}

// Update the field labels guide
function updateFieldGuide(min, hr, day, mon, week) {
  fgMin.textContent = min;
  fgHour.textContent = hr;
  fgDay.textContent = day;
  fgMonth.textContent = mon;
  fgWeekday.textContent = week;
}

// Default state when input is cleared
function showEmptyState() {
  resultCard.classList.remove('hidden');
  errorCard.classList.add('hidden');
  cronExplanation.textContent = 'Enter a valid expression to see details...';
  executionsList.innerHTML = `<li class="run-item" style="grid-template-columns: 1fr; text-align: center; color: var(--text-muted); font-size: 0.9rem;">Waiting for expression input...</li>`;
}

// Dynamic highlighting of guide column based on current cursor placement in input
function highlightField() {
  const val = cronInput.value;
  const selectionEnd = cronInput.selectionStart;
  
  // Slice input up to cursor position and find which space-separated token it belongs to
  const textBeforeCursor = val.substring(0, selectionEnd);
  
  // Count spaces to determine active part index (ignoring double spaces)
  const tokens = textBeforeCursor.trim().split(/\s+/);
  const index = textBeforeCursor.trim() === '' ? 0 : tokens.length - 1;
  
  // Get all field guide columns
  const cols = document.querySelectorAll('.field-col');
  cols.forEach((col, idx) => {
    if (idx === index && val.trim() !== '') {
      col.classList.add('active');
    } else {
      col.classList.remove('active');
    }
  });
}

// Remove all column active highlighting when focus is lost
function removeHighlights() {
  const cols = document.querySelectorAll('.field-col');
  cols.forEach(col => col.classList.remove('active'));
}

// Copy Action handler
async function handleCopy() {
  const text = cronExplanation.textContent;
  if (!text || text.includes('Enter a valid expression')) return;

  try {
    await navigator.clipboard.writeText(text);
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<span>✅</span> Copied!';
    copyBtn.style.borderColor = 'var(--success)';
    
    setTimeout(() => {
      copyBtn.innerHTML = originalText;
      copyBtn.style.borderColor = 'var(--border-subtle)';
    }, 2000);
  } catch (err) {
    console.error('Could not copy description: ', err);
  }
}
