# Pulse Coaching — Client Tracker

A personal training client dashboard for tracking meals, meal plans, workouts, steps, and training time — built with React (Vite) and Tailwind CSS.

## Features

- **Dashboard** — today's calories, steps, training streak, and a weekly activity chart.
- **Nutrition** — pick any date on a calendar and log breakfast/lunch/dinner/snacks with calories.
- **Meal Plans** — browse preset meal plans and apply one to any date.
- **Workouts** — log exercise sessions per day, mark them complete, track steps, and record start/end times.

All data is stored locally in the browser (`localStorage`) — no account or backend required.

## Branding

The current logo mark, wordmark ("PULSE"), and color palette are placeholders inspired by the reference design. Swap them for your real branding in:

- `src/components/Logo.jsx` — logo mark and wordmark
- `src/index.css` — `@theme` color tokens (`--color-primary`, `--color-secondary`, etc.) and fonts

## Getting Started

```bash
npm install
npm run dev
```

Open the printed local URL in your browser.

## Build

```bash
npm run build
npm run preview
```
