import { ActiveSelection, Group } from "fabric";
import useStampStore, { history } from "../store/useStampStore";
import {
  CANVAS_SIZE,
  EXTRA_PROPS,
  applyTemplate,
  exportPNG,
  exportSVG,
  nextId,
} from "./canvas";
import { getTemplate } from "../templates";

const S = () => useStampStore.getState();
const C = () => useStampStore.getState().canvas;

export function addObject(obj, { select = true } = {}) {
  const canvas = C();
  if (!canvas) return null;
  canvas.add(obj);
  if (select) canvas.setActiveObject(obj);
  canvas.requestRenderAll();
  S().commit();
  S().syncSelection();
  return obj;
}

export async function duplicateSelection() {
  const canvas = C();
  const active = canvas?.getActiveObject();
  if (!active) return;
  const clone = await active.clone(EXTRA_PROPS);
  clone.set({ left: active.left + 24, top: active.top + 24 });
  clone.id = nextId();
  if (clone.type === "activeselection") {
    clone.canvas = canvas;
    clone.forEachObject((o) => {
      o.id = nextId();
      canvas.add(o);
    });
    clone.setCoords();
  } else {
    canvas.add(clone);
  }
  canvas.setActiveObject(clone);
  canvas.requestRenderAll();
  S().commit();
  S().syncSelection();
}

export function deleteSelection() {
  const canvas = C();
  const objs = canvas?.getActiveObjects() || [];
  if (!objs.length) return;
  canvas.remove(...objs);
  canvas.discardActiveObject();
  canvas.requestRenderAll();
  S().commit();
  S().syncSelection();
}

export function groupSelection() {
  const canvas = C();
  const active = canvas?.getActiveObject();
  if (!active || active.type !== "activeselection") return;
  const objs = active.removeAll();
  canvas.remove(...objs);
  const group = new Group(objs);
  group.id = nextId();
  group.name = `Group (${objs.length})`;
  canvas.add(group);
  canvas.setActiveObject(group);
  canvas.requestRenderAll();
  S().commit();
  S().syncSelection();
  S().toast("Grouped layers", "success");
}

export function ungroupSelection() {
  const canvas = C();
  const active = canvas?.getActiveObject();
  if (!active || active.type !== "group") return;
  const objs = active.removeAll();
  canvas.remove(active);
  objs.forEach((o) => {
    if (!o.id) o.id = nextId();
    canvas.add(o);
  });
  const sel = new ActiveSelection(objs, { canvas });
  canvas.setActiveObject(sel);
  canvas.requestRenderAll();
  S().commit();
  S().syncSelection();
  S().toast("Ungrouped", "info");
}

const layerOp = (fn) => () => {
  const canvas = C();
  const objs = canvas?.getActiveObjects() || [];
  if (!objs.length) return;
  objs.forEach((o) => fn(canvas, o));
  canvas.requestRenderAll();
  S().commit();
};

export const bringForward = layerOp((c, o) => c.bringObjectForward(o));
export const sendBackwards = layerOp((c, o) => c.sendObjectBackwards(o));
export const bringToFront = layerOp((c, o) => c.bringObjectToFront(o));
export const sendToBack = layerOp((c, o) => c.sendObjectToBack(o));

export function nudge(dx, dy) {
  const canvas = C();
  const active = canvas?.getActiveObject();
  if (!active) return;
  active.set({ left: active.left + dx, top: active.top + dy });
  active.setCoords();
  canvas.requestRenderAll();
  S().touchSelection();
}

export function alignSelection(mode) {
  const canvas = C();
  const active = canvas?.getActiveObject();
  if (!active) return;
  const c = CANVAS_SIZE / 2;
  const center = active.getCenterPoint();
  if (mode === "h" || mode === "both")
    active.set({ left: active.left + (c - center.x) });
  if (mode === "v" || mode === "both")
    active.set({ top: active.top + (c - center.y) });
  active.setCoords();
  canvas.requestRenderAll();
  S().commit();
  S().touchSelection();
}

export function selectAll() {
  const canvas = C();
  if (!canvas) return;
  const objs = canvas.getObjects().filter((o) => o.selectable !== false);
  if (!objs.length) return;
  canvas.discardActiveObject();
  const sel = new ActiveSelection(objs, { canvas });
  canvas.setActiveObject(sel);
  canvas.requestRenderAll();
  S().syncSelection();
}

export function clearCanvas(silent) {
  const canvas = C();
  if (!canvas) return;
  history.lock();
  canvas.remove(...canvas.getObjects());
  canvas.discardActiveObject();
  canvas.requestRenderAll();
  history.unlock();
  S().commit();
  S().syncSelection();
  if (!silent) S().toast("Canvas cleared", "info");
}

export function loadTemplate(idOrTemplate) {
  const canvas = C();
  if (!canvas) return;
  const tpl =
    typeof idOrTemplate === "string" ? getTemplate(idOrTemplate) : idOrTemplate;
  history.lock();
  applyTemplate(canvas, tpl);
  history.unlock();
  S().commit();
  S().syncSelection();
  S().setDesignName(tpl.name);
  S().toast(`Template "${tpl.name}" applied`, "success");
}

export function doExportPNG(multiplier = 3) {
  const canvas = C();
  if (!canvas) return;
  try {
    const name = exportPNG(canvas, multiplier);
    S().toast(`Exported ${name} @${multiplier}x`, "success");
  } catch (e) {
    S().toast(`Export failed: ${e.message}`, "error");
  }
}

export function doExportSVG() {
  const canvas = C();
  if (!canvas) return;
  try {
    const name = exportSVG(canvas);
    S().toast(`Exported ${name}`, "success");
  } catch (e) {
    S().toast(`SVG export failed: ${e.message}`, "error");
  }
}
