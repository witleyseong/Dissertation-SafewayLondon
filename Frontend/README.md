# SafeWay London - Web app

This is the web frontend for my final year project, SafeWay London. It compares public transport routes in London (using TfL data) by how much **historical recorded crime** they pass near on the walking parts.

The app does **not** predict safety. It only compares past police-recorded crime data, so it always says "exposure" and never "safe", "dangerous" or "risk".

## What it does

- Register / log in (JWT, stored in the browser)
- Search a journey between two places in London, or start from your current location
- Pick the right place when TfL finds several matches for what you typed
- Compare the routes by time and by crime exposure, with "Fastest", "Lowest exposure" and "Balanced" labels
- Show the selected route on a map: tube lines in their TfL colours, buses in red, and walking parts dotted and coloured by exposure (green = lower, amber = moderate, orange-red = higher)
- Step-by-step list of the journey with the exposure of each walking leg and a breakdown by crime category
- **Start journey**: full-screen step-by-step navigation with TfL's own instructions (turn-by-turn directions for walks, stops for buses and trains), the exposure of each walk, time left and arrival time, and Back / Next step buttons (or the arrow keys)
- Live location on the map; during navigation the app moves to the next step on its own when you reach the end of the current one
- Journey history (saved by the backend) and recent searches (saved in the browser)
- About the data page and a help page with support contacts

## Tech stack

- React 18 + JavaScript
- Vite (dev server and build)
- React Router
- Leaflet / react-leaflet with OpenStreetMap tiles
- Fetch API to talk to the Node/Express backend

## Setup

**1. Start the backend first**

Follow the README in the `Backend` folder (`docker compose up -d`, then `npm run dev`). Check that http://localhost:3000/api/health opens in a browser and shows `"status":"ok"`.

**2. Run the web app**

```bash
cd Frontend
npm install
npm run dev
```

Open http://localhost:5173. The pill at the top should say "API: ok" with a green dot. If it is red, the backend is not running.

In development Vite forwards every `/api` request to `http://localhost:3000` (see `vite.config.js`), so no extra configuration is needed.

**3. Try a journey**

1. Click **Create one** on the login page and register with any email and a password with at least 8 characters.
2. Type `Victoria Station` in **From** and `Liverpool Street Station` in **To**.
3. Click **Compare routes**. If a list of places appears, pick one for each search.

You should see 2 or 3 routes. Click a route to see it on the map. The 📍 button next to **From** uses your current location (the browser will ask for permission).

## Production build

```bash
npm run build      # outputs to dist/
npm run preview    # serves the build locally
```

If the API is served from a different origin, set `VITE_API_URL` (see `.env.example`) before building.

## Project structure

```
src/
├── main.jsx                # entry point
├── App.jsx                 # routes
├── index.css               # styles (light and dark mode)
├── api/client.js           # fetch wrapper and API calls
├── context/AuthContext.jsx # login state
├── hooks/                  # recent searches
├── components/             # navbar, journey card, map, leg list, etc.
├── pages/                  # planner, navigation, history, login, register, about, help
└── utils/                  # exposure bands, TfL line colours, formatting
```

## Troubleshooting

| Problem | Fix |
|---|---|
| Pill at the top is red / "Connecting..." | The backend is not running, or the database is still loading. Check http://localhost:3000/api/health |
| "Current location" finds no routes | You need to be in London, or type the starting place instead |
| Logged out unexpectedly | The token expired (7 days) or the database was reset. Log in again |
