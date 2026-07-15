# Mac Safety Take Home — Field Project Tracker

A lightweight tracker for field-operations projects, built as the basic
framework of a **Mac-style desktop app**. Projects are managed in a native-feeling
macOS UI and shown two ways: a sortable **table** and an interactive **map**.

> **Platform note.** The brief asked for a "Mac app." This implementation is a
> web app that renders an authentic macOS desktop shell (titlebar, sidebar,
> SF system type, light/dark) so it is fully runnable and verifiable in
> any browser — and so it can use the web design tooling in `DESIGN.md`. It is
> structured to wrap cleanly in Tauri/Electron to ship as a real `.app`. See
> [Packaging as a real Mac app](#packaging-as-a-real-mac-app).

## Features

- **Full project CRUD** — create, edit, complete (toggle), duplicate, and delete.
- **Fields** — title, status (`planned/active/blocked/done`), priority
  (`low/medium/high`), notes, due date, and location (label + **latitude /
  longitude**).
- **Table view** — sortable columns, search, filter by status & priority, hide
  completed, inline complete/edit/duplicate/delete, overdue highlighting.
- **Map view** — every project with coordinates is plotted with a status-colored
  pin; click to select, double-click to edit, auto-fit bounds, popups, legend.
- **Local persistence** — everything is saved to `localStorage`; reload-safe.
- **Light / dark / system** appearance, keyboard shortcuts (`⌘N`, `⌘F`).

## Third-party APIs

All three are **free and require no API key**, so the app runs with zero setup.

| Integration | Provider | What it adds |
| ----------- | -------- | ------------ |
| **Map** (required) | **MapLibre GL** + CARTO/OpenStreetMap raster tiles | The interactive map and pins. No Mapbox/Google token needed. |
| **Weather** | **Open-Meteo Forecast API** | Live on-site conditions (temp, wind, sky) per project location — directly useful for planning field work. Shown in the table's *Conditions* column and in the editor. |
| **Geocoding** | **Open-Meteo Geocoding API** | Type a place name in the editor to resolve it to lat/lng instead of entering coordinates by hand. |

## Tech stack

React 18 · TypeScript · Vite · Zustand (state + persistence) · MapLibre GL.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts: `npm run build` (typecheck + production build), `npm run preview`,
`npm run typecheck`.

> Network note: the map tiles, weather, and geocoding call external hosts at
> runtime. On a normal machine they load automatically. In a locked-down/offline
> sandbox the basemap renders blank and weather shows `n/a` — the app degrades
> gracefully and never crashes.

## Project structure

```
src/
  api/
    weather.ts        Open-Meteo forecast client
    geocode.ts        Open-Meteo geocoding client
  components/
    TitleBar.tsx      macOS-style titlebar + appearance toggle
    Sidebar.tsx       status filters + overview stats
    Toolbar.tsx       view switch, search, filters, New
    ProjectTable.tsx  sortable table list view
    ProjectMap.tsx    MapLibre map + status pins
    ProjectEditor.tsx slide-over editor (geocode search + weather preview)
    Badges.tsx        status / priority chips
    WeatherChip.tsx   cached per-location weather chip
    icons.tsx         inline SVG icon set
  store.ts            Zustand store, filtering/sorting, seed data
  types.ts            Project model + helpers
  theme.ts            system/light/dark resolution
DESIGN.md             design-token system (single source of truth)
```

## Design system

Every visual decision derives from [`DESIGN.md`](./DESIGN.md): a warm-neutral
"field/topographic" palette with a **steel-blue** primary, **clay** secondary,
and a **pine-green** success accent for completed work,
authentic macOS system type (deliberately **not** Inter/Roboto/Arial), full
light + dark ramps, and an accessibility checklist (AA contrast, visible focus,
keyboard paths, reduced-motion). No purple gradients.

## Packaging as a real Mac app

The UI is a self-contained web build, so shipping a native `.app` is a wrapper
step (needs a Mac to build/sign):

```bash
npm create tauri-app   # point it at this Vite build, or add Tauri to this repo
npm run tauri build    # produces Mac Safety Take Home.app / .dmg
```

## License

MIT
