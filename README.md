# E-Stamp - Rubber Stamp Maker

https://ar4web.github.io/estamp/

A 100% client-side rubber stamp designer. No backend, no database, no API keys —
everything (fonts, canvas, storage, export) runs in the browser and deploys as
static files.

Highlights: 16 categorised templates (single/double/triple ring, square, oval,
logo), Arabic contextual shaping on straight and curved text, curve-anywhere
text conversion, auto stamp generator, ink distress / rough-edge / aged-paper
effects, transparent PNG + SVG export, selection-aware right-click tool menu,
and a neutral dark **brass** UI theme that never competes with blue stamp ink.

**Stack:** React 18/19 · Vite · Fabric.js v6 · Tailwind CSS v4 · Zustand · localStorage

---

## Quick start

You only need **Node.js 18 or newer**. Check with `node -v`.

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default **http://localhost:5173**).

That's it — there is nothing else to configure. No `.env`, no database, no
backend service.

### All commands

| Command           | What it does                                   |
| ----------------- | ---------------------------------------------- |
| `npm install`     | Install dependencies (~10s, 98 packages)        |
| `npm run dev`     | Start the dev server with hot reload            |
| `npm run build`   | Build static output into `dist/`                |
| `npm run preview` | Preview the production build locally            |

---

## Why installs are fast here (important)

`fabric` ships two **optional** dependencies meant for running Fabric in
Node.js: `canvas` and `jsdom`.

`canvas` is a **native module**. On a machine without Python, Visual Studio
Build Tools, Cairo and Pango, npm falls back to compiling it with `node-gyp`,
which commonly **hangs for hours or fails outright**. This is the single most
frequent cause of "npm install never finishes" on Fabric.js projects.

This app only ever runs Fabric in the **browser**, so both packages are pure
dead weight. They are neutralised in `package.json`:

```json
"overrides": {
  "canvas": "npm:empty-npm-package@1.0.0",
  "jsdom": "npm:empty-npm-package@1.0.0"
}
```

Measured effect of that single change:

| | Before | After |
| --- | --- | --- |
| Install time | 27s (or hours if it compiles) | **7s** |
| Packages | 219 | **98** |
| `node_modules` size | 334 MB | **137 MB** |
| `node-gyp` native build | yes ⚠️ | **none** |

The production bundle is byte-for-byte identical, because the browser build of
Fabric never imported them.

> Do **not** "fix" this with `npm install --omit=optional`. Rollup ships its
> platform binary (e.g. `@rollup/rollup-linux-x64-gnu`) as an optional
> dependency, and omitting all optionals breaks the build.

---

## Troubleshooting

**`npm install` is stuck / taking forever**

```bash
rm -rf node_modules package-lock.json
npm install
```

Make sure the `overrides` block above is present in `package.json` before
reinstalling. On Windows use `rmdir /s /q node_modules` and `del package-lock.json`.

**`EACCES` / permission errors** — don't use `sudo`; reinstall Node via
[nvm](https://github.com/nvm-sh/nvm) (`nvm use`, this repo has a `.nvmrc`).

**Port 5173 already in use** — `npm run dev -- --port 3000`

**Blank page after deploying** — `vite.config.js` already sets `base: "./"`, so
assets resolve relatively on any host or sub-path.

---

## Deploying

The build is a single self-contained `dist/index.html` (JS + CSS inlined), so
any static host works.

```bash
npm run build
```

- **Vercel** — framework preset *Vite*, build `npm run build`, output `dist`.
- **GitHub Pages** — push the contents of `dist/` to your `gh-pages` branch.
  `base: "./"` means it works from `user.github.io/repo-name/` with no changes.
- **Anything else** — upload `dist/`, or even open `dist/index.html` directly
  from disk.

---

## Project structure

```
index.html              HTML shell + Google Fonts preconnect
vite.config.js          Vite config (base "./" for static hosts)
tailwind.config.js      Tailwind v4, class-based dark mode
src/
  main.jsx              React mount
  App.jsx               Top bar + sidebars + canvas layout
  index.css             CSS variables, dark/light themes, checkerboard
  components/
    TopBar.jsx          Global actions, theme switch, undo/redo, export
    Toast.jsx           Auto-dismissing success / error / info messages
    DraggablePanel.jsx  Draggable panels → bottom sheets under 768px
    ui.jsx              Sliders (100ms debounced), colour picker, toggles
    LeftSidebar/        Text, Shape, Image, Templates, Layers tools
    RightPanel/         Context-aware Text / Shape / Image properties
    CanvasArea/         Fabric canvas, zoom controls, mm/cm rulers
    Modals/             Save-load gallery, template grid, export sizes
  store/useStampStore.js  Zustand state (nodes, viewport, history, toasts)
  templates/            12 stamp blueprints (classic round, seal, PAID…)
  utils/
    canvas.js           Fabric handlers, arc text, snapping, PNG/SVG export
    fonts.js            Dynamic Google Font loading (6 writing systems)
    storage.js          localStorage designs + autosave buffer
    history.js          50-state undo/redo stack
    texture.js          Ink distress / noise engine
    actions.js          Shared canvas commands
  hooks/
    useCanvas.js        Canvas lifecycle + first-run bootstrap
    useKeyboard.js      Global shortcuts
    useAutoSave.js      2s debounced autosave
```

## Keyboard shortcuts

| Keys | Action |
| --- | --- |
| `Ctrl/Cmd + Z` / `Ctrl + Shift + Z` | Undo / Redo |
| `Ctrl + D` | Duplicate |
| `Delete` / `Backspace` | Remove selection |
| `Ctrl + S` | Save design |
| `Ctrl + E` | Export PNG |
| `Ctrl + N` | Clear canvas |
| `Ctrl + G` / `Ctrl + Shift + G` | Group / Ungroup |
| `Ctrl + [` / `Ctrl + ]` | Send backward / Bring forward |
| Arrows / `Shift` + Arrows | Nudge 1px / 10px |
| Mouse wheel | Zoom 50%–400% |
| `Space` + drag | Pan the canvas |
