# Comparison & Videos Pages – Current Status

This document tracks the current implementation status of the **Comparison** page and the **Videos** page in the `indiaindexfunds` app, plus how to run everything locally and what can be improved next.

## 1. Comparison Page

**File:** `indiaindexfunds/src/pages/ComparisonPage.tsx`

### 1.1 What it does now

- **Live index fund list**
  - Fetches funds from the backend endpoint `GET /api/index-funds`.
  - Backend serves data from a parsed AMFI `NAVAll.txt` cache (`backend/data/index-funds-cache.json`).
  - Frontend maps AMFI rows to the app’s `Fund` model and prefers index-like schemes (Nifty/Sensex/Index/ETF) for the selector.

- **Real historical NAVs**
  - When two funds with valid ISINs are selected, the frontend calls `GET /api/nav/:isin` on the backend.
  - Backend proxies to the captnemo mutual fund NAV API and returns daily historical NAVs.
  - Comparison page builds a unified time series for **Fund A** and **Fund B** and overlays:
    - each fund’s normalized NAV (starting from 100), and
    - optional normalized benchmark series (from mock benchmark data) when the Benchmark toggle is on.

- **Real-time metrics from NAV**
  - Uses `src/utils/metricsCalculator.ts` to compute metrics directly from the NAV series:
    - 1Y / 3Y / 5Y total and annualized returns (where enough data exists),
    - annualized volatility (1Y),
    - max drawdown (1Y),
    - simple Sharpe ratio (using a configurable risk-free rate),
    - latest NAV and date.
  - These metrics power the **Fund Metrics** table (`src/components/Comparison/MetricsTable.tsx`).

- **UI / UX highlights**
  - **FundSelector** for picking Fund A / Fund B from the live list.
  - **ComparisonChart**:
    - defaults to **log scale** on the Y-axis, with a toggle to switch to linear.
    - Benchmark toggle to show/hide benchmark curves.
    - Timeframe controls: 1Y / 3Y / 5Y / custom date range.
  - **MetricsTable**:
    - Shows cost, risk, returns and tracking metrics for both funds, side by side.
    - Uses green highlighting for the “better” value on each row where that makes sense.
    - Full-width layout with no internal scrolling so all rows are visible.
  - **Performance Snapshot** card on the right of the chart:
    - Summarizes which fund has had slightly stronger returns over the selected period.
    - Clearly marked as informational only and not an investment recommendation.

### 1.2 Live data status

- **Fund list** – comes from **backend + AMFI cache**, not mock data, when the backend is available.
- **NAV history** – comes from the **captnemo** NAV API via the backend, falling back to mock data only if the API fails.
- **Benchmarks** – currently still use **mock benchmark data** keyed by index name (e.g. `NIFTY 50`). These are for relative comparison only.

### 1.3 Known limitations / TODOs

- Benchmarks are still mock; ideally they should come from a real index data source or be computed from a reliable feed.
- The NAV-based metrics are focused on returns/volatility; more advanced metrics (alpha, beta, tracking error) would require additional data or backend pre-computation.
- Error states for the backend (e.g. NAV API down) are logged and fall back to mock data, but the UI could surface status badges more clearly.
- Accessibility and mobile layout should be reviewed once the design settles.

---

## 2. Videos Page

**Files:**
- Main: `indiaindexfunds/src/pages/VideosPage.tsx`
- Backup/older version: `indiaindexfunds/src/pages/VideosPage.BACKUP.tsx`
- API helper: `indiaindexfunds/src/api/videos.ts`

### 2.1 What it does now

_(Summary reflects the current code structure; adjust here as you evolve the page.)_

- Displays a list/grid of YouTube videos relevant to Indian index funds.
- Fetches video metadata from:
  - A local `public/videos.json` file **or**
  - A backend/YouTube API helper in `src/api/videos.ts` (depending on how it’s wired at the moment).
- Supports basic searching/filtering over video title/description.
- Uses reusable UI components from `src/components/ui` (cards, buttons, etc.) to keep styling consistent with the rest of the app.

### 2.2 Live data status

- The page is currently designed to work safely **without requiring a YouTube API key** in the frontend.
- Depending on your current configuration:
  - If `videos.ts` calls your backend, the backend should be responsible for talking to YouTube and hiding API keys.
  - If you rely purely on `public/videos.json`, the page will show a curated static list (no live search from YouTube).

> If you change how videos are loaded (e.g. new backend endpoint), update this section with the new data flow.

### 2.3 Known limitations / TODOs

- Decide a single source of truth for video data: static JSON vs. backend-powered search.
- Add pagination or lazy loading if the number of videos grows.
- Consider simple analytics (e.g. most-clicked videos) stored on the backend.

---

## 3. Dev Setup & Run Instructions

This repo has two main parts:

- `backend/` – Node/Express + TypeScript API for funds/NAVs.
- `indiaindexfunds/` – Vite + React + TypeScript frontend.

### 3.1 Prerequisites

- Node.js (LTS recommended)
- npm or pnpm
- PostgreSQL (if you’re using the DB pieces of the backend; the basic comparison flow mostly uses AMFI + captnemo)

### 3.2 Backend – setup & run

From the repo root:

```bash
cd backend
npm install

# One-time: ensure AMFI NAVAll.txt is present
# Place the latest NAVAll.txt at:
# backend/data/NAVAll.txt

# Parse the manual AMFI file into a cache used by /api/index-funds
npm run parse-manual

# Start the backend server (default port is typically 5001)
npm run dev
```

Key endpoints:

- `GET /api/index-funds` – list of index funds (from AMFI cache, with filters/deduping).
- `GET /api/nav/:isin` – historical NAVs for a specific ISIN (proxied to captnemo).

> Check `backend/README.md` for more backend-specific details or environment variables.

### 3.3 Frontend – setup & run

From the repo root:

```bash
cd indiaindexfunds
npm install

# Configure backend URL for local dev (if not already set):
# Create .env.local with:
# VITE_BACKEND_URL=http://localhost:5001

npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`) in your browser.

- Comparison page is typically reachable at the main route or a specific path depending on your router (update here if needed).
- Videos page is reachable via its dedicated route (e.g. `/videos`).

---

## 4. Things to Improve / Next Steps

Shortlist of pragmatic next improvements:

1. **Benchmarks from real data**
   - Replace mock benchmark series with an index data source (NSE/BSE or a reliable API).
   - Align benchmark date frequency with fund NAV frequency.

2. **Backend metrics service**
   - Move NAV-based metrics computation into the backend so the frontend only consumes a simple metrics API.
   - Optionally persist metrics in a DB and recompute daily.

3. **Videos page data strategy**
   - Decide between static curated lists vs. live YouTube search via backend, then simplify the code accordingly.
   - Add tags/categories for easier discovery.

4. **Error/health surfacing**
   - Add small status indicators on the Comparison page (e.g. “Live AMFI data”, “Using fallback NAV data”).

5. **Testing & monitoring**
   - Add unit tests for `metricsCalculator.ts` and basic integration tests for the Comparison page.
   - Consider lightweight logging in the backend for NAV/fund fetch failures.

This file is intentionally high-level and should be kept up to date as you evolve the app. When you make significant changes to Comparison or Videos flows, update the relevant section here so new contributors (or future you) can quickly understand the current behavior and limitations.
