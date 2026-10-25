import { create } from "zustand";
import { createHistory } from "../utils/history";
import {
  CANVAS_SIZE,
  deserialize,
  rebuildArc,
  serialize,
  thumbnail,
} from "../utils/canvas";
import * as storage from "../utils/storage";
import { applyAccent, applyCorners, applyThemeClass, DEFAULT_ACCENT } from "../utils/theme";
import { refreshLiveFields } from "../utils/fields";
import { buildStampFile, downloadStampFile, parseStampFile } from "../utils/stampfile";
import { objectInkHex } from "../utils/color";
import { tintFabricImage } from "../utils/image";

export const history = createHistory();

let toastSeq = 0;

export const useStampStore = create((set, get) => ({
  /* ---------------- canvas ---------------- */
  canvas: null,
  ready: false,
  setCanvas: (canvas) => set({ canvas, ready: !!canvas }),

  /* ---------------- selection ------------- */
  selected: null,
  selVersion: 0,
  layerVersion: 0,
  syncSelection: () => {
    const c = get().canvas;
    if (!c) return;
    const active = c.getActiveObject() || null;
    const ink = objectInkHex(active);
    set((s) => ({
      selected: active,
      selVersion: s.selVersion + 1,
      ...(ink ? { inkColor: ink } : {}),
    }));
  },
  touchSelection: () => set((s) => ({ selVersion: s.selVersion + 1 })),
  touchLayers: () => set((s) => ({ layerVersion: s.layerVersion + 1 })),

  /* ---------------- viewport -------------- */
  zoom: 1,
  showRulers: true,
  showGrid: false,
  setZoom: (z) => {
    const c = get().canvas;
    const zoom = Math.min(4, Math.max(0.5, Number(z) || 1));
    if (c) {
      c.setZoom(zoom);
      c.setDimensions({ width: CANVAS_SIZE * zoom, height: CANVAS_SIZE * zoom });
      c.requestRenderAll();
    }
    set({ zoom });
  },
  zoomBy: (delta) => get().setZoom(get().zoom + delta),
  toggleRulers: () => set((s) => ({ showRulers: !s.showRulers })),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  showGuides: storage.getPrefs().showGuides ?? false,
  toggleGuides: () => {
    const showGuides = !get().showGuides;
    storage.setPrefs({ showGuides });
    set({ showGuides });
  },

  /* ---------------- canvas appearance ----------------- */
  selectionColor: storage.getPrefs().selectionColor ?? "#f59e0b",
  selectionBorderWidth: storage.getPrefs().selectionBorderWidth ?? 1,
  setSelectionColor: (color) => {
    const c = get().canvas;
    storage.setPrefs({ selectionColor: color });
    set({ selectionColor: color });
    if (c) {
      c.selectionColor = color;
      c.selectionBorderColor = color;
      c.requestRenderAll();
    }
  },
  setSelectionBorderWidth: (w) => {
    const c = get().canvas;
    storage.setPrefs({ selectionBorderWidth: w });
    set({ selectionBorderWidth: w });
    if (c) {
      c.selectionLineWidth = w;
      c.requestRenderAll();
    }
  },

  gridSize: storage.getPrefs().gridSize ?? 20,
  gridOpacity: storage.getPrefs().gridOpacity ?? 0.35,
  setGridSize: (v) => {
    storage.setPrefs({ gridSize: v });
    set({ gridSize: v });
  },
  setGridOpacity: (v) => {
    storage.setPrefs({ gridOpacity: v });
    set({ gridOpacity: v });
  },

  tooltipPos: storage.getPrefs().tooltipPos ?? "top-right",
  setTooltipPos: (p) => {
    storage.setPrefs({ tooltipPos: p });
    set({ tooltipPos: p });
  },

  /* ---------------- settings drawer ---------------- */
  settingsOpen: false,
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
  toggleSettings: () => set((x) => ({ settingsOpen: !x.settingsOpen })),

  /* ---------------- personalisation / accessibility ---------------- */
  accentColor: storage.getPrefs().accentColor ?? DEFAULT_ACCENT,
  setAccentColor: (hex) => {
    if (!/^#([0-9a-f]{6})$/i.test(hex || "")) return;
    storage.setPrefs({ accentColor: hex });
    applyAccent(hex);
    set({ accentColor: hex });
  },
  a11y: {
    reduceMotion: !!storage.getPrefs().a11yReduceMotion,
    highContrast: !!storage.getPrefs().a11yHighContrast,
    largeControls: !!storage.getPrefs().a11yLargeControls,
    alwaysFocus: !!storage.getPrefs().a11yAlwaysFocus,
  },
  setA11y: (patch) => {
    const next = { ...get().a11y, ...patch };
    const root = document.documentElement;
    root.classList.toggle("a11y-reduce-motion", next.reduceMotion);
    root.classList.toggle("a11y-high-contrast", next.highContrast);
    root.classList.toggle("a11y-large-controls", next.largeControls);
    root.classList.toggle("a11y-always-focus", next.alwaysFocus);
    storage.setPrefs({
      a11yReduceMotion: next.reduceMotion,
      a11yHighContrast: next.highContrast,
      a11yLargeControls: next.largeControls,
      a11yAlwaysFocus: next.alwaysFocus,
    });
    set({ a11y: next });
  },
  uiRadius: storage.getPrefs().uiRadius ?? "soft",
  setUiRadius: (style) => {
    const next = applyCorners(style);
    storage.setPrefs({ uiRadius: next });
    set({ uiRadius: next });
  },
  applyPersonalisation: () => {
    const st = get();
    applyAccent(st.accentColor || DEFAULT_ACCENT);
    applyCorners(st.uiRadius || "soft");
    get().setA11y({ ...st.a11y });
  },

  /* ---------------- theme ----------------- */
  theme: storage.getTheme(),
  applyTheme: (theme) => {
    applyThemeClass(theme);
    storage.setTheme(theme);
    set({ theme });
    applyAccent(get().accentColor || DEFAULT_ACCENT);
  },
  toggleTheme: () => {
    const next = applyThemeClass(get().theme) === "dark" ? "light" : "dark";
    get().applyTheme(next);
  },

  palettes: storage.getPalettes(),
  refreshPalettes: () => set({ palettes: storage.getPalettes() }),
  savePalette: (name, colors) => {
    const record = storage.savePalette({
      name,
      colors: colors || [get().inkColor],
    });
    set({ palettes: storage.getPalettes() });
    get().toast(`Saved ink set "${record.name}"`, "success");
    return record;
  },
  removePalette: (id) => {
    storage.deletePalette(id);
    set({ palettes: storage.getPalettes() });
    get().toast("Ink set removed", "info");
  },

  company: storage.getCompany(),
  setCompany: (patch) => {
    const company = storage.setCompany(patch);
    set({ company });
    return company;
  },

  /* ---------------- ink ------------------- */
  inkColor: storage.getPrefs().inkColor ?? "#003399",
  setInkColor: (inkColor) => {
    storage.setPrefs({ inkColor });
    set({ inkColor });
    const c = get().canvas;
    if (!c) return;
    const active = c.getActiveObjects() || [];
    const objs = active.length ? [...active] : [];
    if (!objs.length) return;
    const jobs = [];
    objs.forEach((o) => {
      if (o.stampMeta) o.stampMeta = { ...o.stampMeta, ink: inkColor };
      if (o.stampMeta?.kind === "arc") {
        rebuildArc(c, o, { fill: inkColor });
        return;
      }
      if (o.type === "image") {
        jobs.push(tintFabricImage(c, o, inkColor));
        return;
      }
      const solid = o.fill && o.fill !== "transparent";
      if (o.stroke) o.set({ stroke: inkColor });
      if (solid || !o.stroke) o.set({ fill: inkColor });
      if (o.type === "group") {
        o.forEachObject?.((ch) => {
          if (ch.stroke) ch.set({ stroke: inkColor });
          if (ch.fill && ch.fill !== "transparent") ch.set({ fill: inkColor });
        });
      }
      o.setCoords?.();
    });
    const finish = () => {
      c.requestRenderAll();
      get().commit();
      get().touchSelection();
    };
    if (jobs.length) Promise.all(jobs).then(finish).catch(finish);
    else finish();
  },

  /* ---------------- colours --------------- */
  canvasColor: storage.getPrefs().canvasColor ?? "",
  workspaceColor: storage.getPrefs().workspaceColor ?? "",
  setCanvasColor: (hex) => {
    const c = get().canvas;
    if (c) {
      c.backgroundColor = hex || undefined;
      c.requestRenderAll();
    }
    storage.setPrefs({ canvasColor: hex });
    set({ canvasColor: hex });
  },
  setWorkspaceColor: (hex) => {
    storage.setPrefs({ workspaceColor: hex });
    set({ workspaceColor: hex });
  },

  /* ---------------- panels ---------------- */
  leftOpen: true,
  rightOpen: true,
  toggleLeft: () => set((s) => ({ leftOpen: !s.leftOpen })),
  toggleRight: () => set((s) => ({ rightOpen: !s.rightOpen })),
  pulseTemplates: false,
  setPulseTemplates: (v) => set({ pulseTemplates: v }),

  /* ---------------- modals ---------------- */
  modal: null,
  openModal: (modal) => set({ modal }),
  closeModal: () => set({ modal: null }),

  /* opens (and scrolls to) a section of the right sidebar */
  focusSection: null,
  revealSection: (id) => {
    if (id === "settings" || id === "options") {
      set({ settingsOpen: true });
      return;
    }
    if (!get().rightOpen) set({ rightOpen: true });
    set({ focusSection: id });
    setTimeout(() => set({ focusSection: null }), 600);
  },

  /* ---------------- toasts ---------------- */
  toasts: [],
  toast: (message, type = "info", action = null) => {
    const last = get().toasts[0];
    if (last && last.message === message) return last.id;
    const id = ++toastSeq;
    set({ toasts: [{ id, message, type, action }] });
    setTimeout(() => get().dismissToast(id), action ? 8000 : 2200);
    return id;
  },
  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  /* ---------------- history --------------- */
  canUndo: false,
  canRedo: false,
  dirty: false,
  commit: () => {
    const c = get().canvas;
    if (!c || history.locked) return;
    const changed = history.push(serialize(c));
    if (changed)
      set({
        canUndo: history.canUndo(),
        canRedo: history.canRedo(),
        dirty: true,
      });
    get().touchLayers();
  },
  resetHistory: () => {
    const c = get().canvas;
    if (!c) return;
    history.reset(serialize(c));
    set({ canUndo: false, canRedo: false });
  },
  undo: async () => {
    const c = get().canvas;
    const state = history.undo();
    if (!c || !state) return;
    history.lock();
    await deserialize(c, state);
    history.unlock();
    set({
      canUndo: history.canUndo(),
      canRedo: history.canRedo(),
      selected: null,
      dirty: true,
    });
    get().touchLayers();
  },
  redo: async () => {
    const c = get().canvas;
    const state = history.redo();
    if (!c || !state) return;
    history.lock();
    await deserialize(c, state);
    history.unlock();
    set({
      canUndo: history.canUndo(),
      canRedo: history.canRedo(),
      selected: null,
      dirty: true,
    });
    get().touchLayers();
  },

  /* ---------------- designs --------------- */
  designs: storage.getDesigns(),
  currentDesignId: null,
  designName: "Untitled stamp",
  setDesignName: (designName) => set({ designName }),
  refreshDesigns: () => set({ designs: storage.getDesigns() }),
  saveCurrent: (name) => {
    const c = get().canvas;
    if (!c) return null;
    const record = storage.saveDesign({
      id: get().currentDesignId,
      name: name || get().designName,
      json: serialize(c),
      thumb: thumbnail(c),
    });
    set({
      currentDesignId: record.id,
      designName: record.name,
      designs: storage.getDesigns(),
      dirty: false,
    });
    get().toast(`Saved "${record.name}"`, "success");
    return record;
  },
  saveAsNew: (name) => {
    set({ currentDesignId: null });
    return get().saveCurrent(name || `${get().designName} copy`);
  },
  loadDesign: async (id) => {
    const c = get().canvas;
    const record = storage.getDesigns().find((d) => d.id === id);
    if (!c || !record) return;
    history.lock();
    await deserialize(c, record.json);
    history.unlock();
    set({
      currentDesignId: record.id,
      designName: record.name,
      selected: null,
      dirty: false,
    });
    get().resetHistory();
    get().touchLayers();
    get().toast(`Loaded "${record.name}"`, "success");
  },
  removeDesign: (id) => {
    storage.deleteDesign(id);
    set({ designs: storage.getDesigns() });
    get().toast("Design deleted", "info");
  },
  exportStampFile: () => {
    const c = get().canvas;
    if (!c) return null;
    const name = downloadStampFile(
      buildStampFile({
        name: get().designName,
        json: serialize(c),
        ink: get().inkColor,
        canvasColor: get().canvasColor,
        company: get().company,
      }),
      get().designName
    );
    get().toast(`Exported ${name}`, "success");
    return name;
  },
  importStampFile: async (file) => {
    const c = get().canvas;
    if (!c || !file) return;
    const data = parseStampFile(await file.text());
    history.lock();
    await deserialize(c, data.json);
    history.unlock();
    if (data.ink) {
      storage.setPrefs({ inkColor: data.ink });
      set({ inkColor: data.ink });
    }
    if (data.canvasColor != null) get().setCanvasColor(data.canvasColor);
    if (data.company) get().setCompany(data.company);
    set({
      currentDesignId: null,
      designName: data.name || "Imported stamp",
      selected: null,
      dirty: true,
    });
    get().resetHistory();
    get().touchLayers();
    get().toast(`Imported "${data.name || file.name}"`, "success");
  },
  refreshFields: (opts) => {
    const c = get().canvas;
    if (!c) return;
    if (refreshLiveFields(c, opts)) {
      get().commit();
      get().touchSelection();
    }
  },

  clips: storage.getClips(),
  refreshClips: () => set({ clips: storage.getClips() }),
  addClip: ({ name, json, thumb }) => {
    const record = storage.saveClip({ name, json, thumb });
    set({ clips: storage.getClips() });
    get().toast(`Saved clip "${record.name}"`, "success");
    return record;
  },
  removeClip: (id) => {
    storage.deleteClip(id);
    set({ clips: storage.getClips() });
    get().toast("Clip removed", "info");
  },

  /* ---------------- autosave -------------- */
  restoreAutosave: async () => {
    const c = get().canvas;
    const buf = storage.readAutosave();
    if (!c || !buf) return false;
    history.lock();
    await deserialize(c, buf.json);
    history.unlock();
    get().resetHistory();
    get().touchLayers();
    set({ selected: null });
    get().toast("Previous session restored", "success");
    return true;
  },
  discardAutosave: () => {
    storage.clearAutosave();
    get().toast("Draft session cleared", "info");
  },
  resetStudioPrefs: () => {
    storage.resetPrefs();
    get().toast("Studio settings reset — reload to apply", "info");
    window.location.reload();
  },
}));

export default useStampStore;
