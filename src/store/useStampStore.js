import { create } from "zustand";
import { createHistory } from "../utils/history";
import {
  CANVAS_SIZE,
  deserialize,
  serialize,
  thumbnail,
} from "../utils/canvas";
import * as storage from "../utils/storage";

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
    set((s) => ({ selected: active, selVersion: s.selVersion + 1 }));
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

  /* ---------------- theme ----------------- */
  theme: storage.getTheme(),
  applyTheme: (theme) => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
    storage.setTheme(theme);
    set({ theme });
  },
  toggleTheme: () =>
    get().applyTheme(get().theme === "dark" ? "light" : "dark"),

  /* ---------------- ink ------------------- */
  inkColor: "#000000",
  setInkColor: (inkColor) => set({ inkColor }),

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

  /* ---------------- toasts ---------------- */
  toasts: [],
  toast: (message, type = "info", action = null) => {
    const id = ++toastSeq;
    set((s) => ({ toasts: [...s.toasts, { id, message, type, action }] }));
    setTimeout(() => get().dismissToast(id), action ? 9000 : 3000);
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
}));

export default useStampStore;
