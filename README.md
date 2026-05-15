# Porchfest

A mobile-first web app for navigating **Montclair Porchfest** — designed to feel like a native iOS/Android app while being just static HTML/CSS/JS that can be hosted anywhere (GitHub Pages, Cloudflare Pages, S3, anything).

Live event: **Saturday, May 16, 2026 · 12–5 PM**, finale 5–10 PM at Lackawanna Plaza.

## Features

- **Now tab** — time-aware home screen that shows "playing now near you" and "up next" based on the real wall clock and your location.
- **Schedule tab** — full schedule grouped by hour, with search (artist / genre / street) and genre chips.
- **Map tab** — Leaflet map of every porch with pins colored by status (live / soon / done) plus your location.
- **Saved tab** — bookmark shows; your day, in order. Persisted in localStorage.
- **Bottom sheet detail view** — show details, walking distance, "Walk here" button (deep-links to Google Maps walking directions), and "also on this porch" list.
- **Demo time slider** — simulate any time during the festival, useful before/after the real day.
- **Geolocation-aware** — sorts cards by walking distance, recenters the map.
- **PWA** — installable, offline app shell via service worker (tiles cached on view).
- **Dark + light mode** via `prefers-color-scheme`.
- **Safe-area aware** — works on iOS notch/home-indicator devices.

## Run locally

It's plain static files. Any local server works:

```
python3 -m http.server 8000
# then open http://localhost:8000
```

## Data

`assets/data.js` ships with a representative seed dataset (30 porches, 75 acts across 5 time slots). The official Porchfest map page blocks scraping, so this is structured to make swapping in the live feed trivial — just replace `PORCHES` and `ACTS`.

## Files

- `index.html` — app shell, tab bar, hero, views
- `assets/styles.css` — design system (dark/light, gradients, safe-area)
- `assets/app.js` — state, render, geolocation, sheet, map glue
- `assets/data.js` — porches + acts
- `assets/icon.svg` — app icon (gradient + porch + music note)
- `manifest.webmanifest` — PWA manifest
- `sw.js` — offline service worker
