# CronOps - Crontab Visualizer Dashboard

CronOps is a premium, minimal, and visually stunning Crontab Visualizer built 100% in the frontend. It features glassmorphic visual layouts, real-time cron translation, a 5-field interactive breakdown guide that responds to your input cursor, a schedule generator showing the next 10 executions, and a built-in timezone selector to switch between Local and UTC times.

Designed for both exploration and learning, the app demonstrates how to parse scheduling strings, perform timezone-based date-time arithmetic, query and iterate date ranges, map text cursor selections to active DOM coordinates, and construct an interactive developer tool without heavy backend components.

---

## Tech Stack

Here is the lightweight tech stack used for building this frontend-only application:

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-%2343853D.svg?style=for-the-badge&logo=node.dot-js&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

---

## Core Features

*   **Real-Time Cron Translation**: Converts any valid standard 5-field or extended 6-field cron expression into a clear, natural English sentence instantly as you type.
*   **Dynamic Column Guide**: Monitors the text cursor location within the input field. If your cursor moves to the minute, hour, day, month, or weekday position, the corresponding field card in the guide lights up.
*   **Timezone-Aware Calculations**: Generates the exact timestamps for the next 10 consecutive executions. Provides a toggle to switch execution schedules between your local timezone and UTC (+00:00).
*   **Relative Execution Timers**: Displays custom countdown tags (e.g. "in 3 hrs", "in 5 mins") beside each execution date. Automatically highlights the nearest upcoming execution cycle.
*   **Preset Template Library**: Provides quick-select buttons for common cron patterns (such as hourly runs, daily backups, work-hour intervals, or monthly schedules) to allow instant testing.
*   **Syntax Error Catching**: Catches errors dynamically from the parser and swaps the display card to show a red warning banner containing detailed syntax issues.
*   **Clipboard Copy Action**: Includes a single-click copy button to easily duplicate the generated English sentence for documentation or ticket references.

---

## Project Structure

```text
Crontab-Visualizer/
├── index.html          # Semantic HTML5 shell and DOM layouts
├── vite.config.js      # Vite developer server and builder configuration
├── package.json        # Project packages configuration and dependencies
├── README.md           # This document (Project documentation)
└── src/                # Application source folder
    ├── main.js         # Event routers, translation, date iterators, and cursor guides
    └── style.css       # Core styling variables, layout grids, animations, and transitions
```

---

*Made for learning DevOps scheduling. Learn, upgrade, and enjoy tracking.*