# Maintenance Risk Console

Predictive vehicle-maintenance dashboard. Combines mileage, service history, fuel-economy trend, and diagnostic-code data into a live composite risk score — surfaces likely upcoming failures before they happen, instead of waiting on a breakdown.

No build step, no backend, no dependencies. Static HTML/CSS/JS.

## Features

- **Composite risk gauge (0–100)** — weighted blend of five factors: service-interval overrun, time since last service, fuel-economy drop, active diagnostic codes (count + severity), and vehicle age/mileage.
- **KPI cards** — predicted failure count, estimated maintenance cost, estimated shop downtime, recalculated live.
- **Component risk breakdown** — ranked list of subsystems (brakes, coolant, O2 sensor, ignition, transmission, tires) each with a risk bar and the driving factor behind it.
- **Driving-profile multiplier** — commuter / city / highway / towing adjusts the whole model.
- Fully client-side; every input recalculates instantly with no network call.

## Live demo

Open `index.html` directly in a browser, or serve locally (see below).

## Getting started

```bash
git clone https://github.com/<your-username>/maintenance-risk-console.git
cd maintenance-risk-console
npm install
npm run dev
```

`npm run dev` serves the project at `http://localhost:3000` using [`serve`](https://www.npmjs.com/package/serve). Because this is static HTML/CSS/JS, you can equally just open `index.html` in a browser with no server at all.

## Project structure

```
maintenance-risk-console/
├── index.html              # markup / page structure
├── css/
│   └── style.css           # design tokens + layout
├── js/
│   └── app.js               # risk model + live recalculation
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Pages deploy on push to main
├── package.json
├── LICENSE
├── CONTRIBUTING.md
└── .gitignore
```

## Risk model

Each input is normalized to a 0–1 factor, weighted, and summed:

| Factor | Weight | Driven by |
|---|---|---|
| Service-interval overrun | 28% | miles since last service ÷ 5,000 mi interval |
| Time since last service | 18% | months since last service |
| Fuel-economy drop | 20% | % below baseline economy |
| Diagnostic codes | 28% | code count × severity (none/minor/moderate/severe) |
| Vehicle age/mileage | 6% | total odometer mileage |

The composite is then scaled by a **driving-profile multiplier** (0.8× highway-heavy to 1.5× towing/heavy-load) and clamped to 0–100.

Per-component scores reuse these same factors with different weightings (e.g. "O2 sensor / fuel system" is driven mainly by the fuel-economy factor; "Engine / emissions check" is driven mainly by severe diagnostic codes). Components scoring ≥ 45% are counted as predicted failures and roll into the cost/downtime KPI estimates.

This is a heuristic planning model, not a certified diagnostic tool — the numbers are directionally useful, not a substitute for an inspection.

## Deployment

The included [`deploy.yml`](.github/workflows/deploy.yml) workflow publishes `index.html`, `css/`, and `js/` to GitHub Pages on every push to `main`. Enable Pages under **Settings → Pages → Source: GitHub Actions** after pushing.

## Roadmap ideas

- [ ] Persist inputs to `localStorage`
- [ ] Multi-vehicle fleet view
- [ ] CSV import for real OBD-II diagnostic logs
- [ ] Export risk report as PDF

## License

MIT — see [LICENSE](LICENSE).
