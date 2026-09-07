# Contributing

## Setup

```bash
git clone https://github.com/<your-username>/maintenance-risk-console.git
cd maintenance-risk-console
npm install
npm run dev
```

## Structure

- `index.html` — markup only, no inline styles/scripts.
- `css/style.css` — all styling; uses CSS custom properties (`:root`) as the design-token layer. Add new colors/spacing there, not as magic numbers in rules.
- `js/app.js` — all logic. The risk model lives in `recalc()`; component weightings live in the `comps` array inside it.

## Making changes

1. Branch from `main`: `git checkout -b feature/your-change`.
2. Keep `index.html`, `style.css`, `app.js` decoupled — no inline `style=` or `onclick=` attributes.
3. Test by opening `index.html` directly and via `npm run dev`; check all sliders/selects recalculate correctly and the gauge color thresholds (34 / 67) still make sense against your change.
4. Open a PR against `main` with a short description of the change and, if you touched the risk model, the reasoning behind any new weights.

## Reporting issues

Open a GitHub issue with: what input combination produced the unexpected result, what you expected, and what the console showed.
