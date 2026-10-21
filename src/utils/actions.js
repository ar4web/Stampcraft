import { ActiveSelection, Group, util } from "fabric";
import useStampStore, { history } from "../store/useStampStore";
import {
  CANVAS_SIZE,
  EXTRA_PROPS,
  applyTemplate,
  exportJPG,
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

export function alignToPaper(edge) {
  const canvas = C();
  const active = canvas?.getActiveObject();
  if (!active) {
    S().toast("Select a layer to align", "info");
    return;
  }
  const b = active.getBoundingRect();
  const pad = 28;
  let dx = 0;
  let dy = 0;
  if (edge === "left") dx = pad - b.left;
  else if (edge === "right") dx = CANVAS_SIZE - pad - (b.left + b.width);
  else if (edge === "top") dy = pad - b.top;
  else if (edge === "bottom") dy = CANVAS_SIZE - pad - (b.top + b.height);
  else if (edge === "h" || edge === "both") dx = CANVAS_SIZE / 2 - (b.left + b.width / 2);
  if (edge === "v" || edge === "both") dy = CANVAS_SIZE / 2 - (b.top + b.height / 2);
  if (edge === "h") dy = 0;
  if (edge === "v") dx = 0;
  active.set({ left: active.left + dx, top: active.top + dy });
  active.setCoords();
  canvas.requestRenderAll();
  S().commit();
  S().touchSelection();
}

export function rotateSelection(deg) {
  const canvas = C();
  const active = canvas?.getActiveObject();
  if (!active) {
    S().toast("Select a layer to rotate", "info");
    return;
  }
  active.rotate((active.angle || 0) + deg);
  active.setCoords();
  canvas.requestRenderAll();
  S().commit();
  S().touchSelection();
}

export function flipSelection(axis) {
  const canvas = C();
  const active = canvas?.getActiveObject();
  if (!active) {
    S().toast("Select a layer to flip", "info");
    return;
  }
  if (axis === "h") active.set({ flipX: !active.flipX });
  else active.set({ flipY: !active.flipY });
  active.setCoords();
  canvas.requestRenderAll();
  S().commit();
  S().touchSelection();
}

export async function placeClip(clip) {
  const canvas = C();
  if (!canvas || !clip?.json) return;
  const json = clip.json;
  const list = Array.isArray(json) ? json : json.objects ? json.objects : [json];
  const objs = await util.enlivenObjects(list);
  if (!objs.length) return;
  objs.forEach((o) => {
    o.id = nextId();
    canvas.add(o);
  });
  if (objs.length === 1) canvas.setActiveObject(objs[0]);
  else {
    const sel = new ActiveSelection(objs, { canvas });
    canvas.setActiveObject(sel);
  }
  canvas.requestRenderAll();
  S().commit();
  S().syncSelection();
  S().toast(`Placed "${clip.name}"`, "success");
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

export function loadTemplate(idOrTemplate, { silent = false } = {}) {
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
  if (!silent) S().toast(`Template "${tpl.name}" applied`, "success");
}

export function doExportPNG(multiplier = 3, options = {}) {
  const canvas = C();
  if (!canvas) return;
  try {
    const name = exportPNG(canvas, multiplier, undefined, options);
    const suffix = options.transparentOnly === false ? "" : " (Transparent)";
    S().toast(`Exported ${name} @${multiplier}x${suffix}`, "success");
  } catch (e) {
    S().toast(`Export failed: ${e.message}`, "error");
  }
}

export function doExportSVG(options = {}) {
  const canvas = C();
  if (!canvas) return;
  try {
    const name = exportSVG(canvas, undefined, options);
    S().toast(`Exported ${name} (SVG Vector)`, "success");
  } catch (e) {
    S().toast(`SVG export failed: ${e.message}`, "error");
  }
}

export function doExportJPG(multiplier = 3, options = {}) {
  const canvas = C();
  if (!canvas) return;
  try {
    const name = exportJPG(canvas, multiplier, undefined, options);
    S().toast(`Exported ${name} @${multiplier}x`, "success");
  } catch (e) {
    S().toast(`JPG export failed: ${e.message}`, "error");
  }
}

/* ------------------------------------------------------------------ */
/* auto stamp generator — full design from any-language text           */
/* ------------------------------------------------------------------ */

import { CANVAS_SIZE as SIZE, createSpecObject as spec } from "./canvas";

const fit = (text, base, min, max) => {
  const len = Math.max(4, String(text || "").length);
  return Math.max(min, Math.min(max, Math.round(base / len) * 10));
};

/**
 * Builds a complete, balanced stamp from user text. Works in every
 * script — Arabic arcs stay joined via the shaping engine.
 */
export function generateAutoStamp({ name, center, bottom, shape, ink, font }) {
  const canvas = C();
  if (!canvas) return;
  const CC = SIZE / 2;
  const specs = [];

  if (shape === "rect") {
    specs.push(
      { type: "rect", w: 500, h: 250, rx: 6, cx: CC, cy: CC, stroke: ink, strokeWidth: 8 },
      { type: "rect", w: 472, h: 222, rx: 2, cx: CC, cy: CC, stroke: ink, strokeWidth: 2 }
    );
    if (name)
      specs.push({ type: "text", text: name, fontSize: fit(name, 260, 22, 44), fontFamily: font, fontWeight: "700", fill: ink, cx: CC, cy: CC - 62, w: 440, charSpacing: 0 });
    specs.push({ type: "line", x1: CC - 180, y1: CC - 22, x2: CC + 180, y2: CC - 22, stroke: ink, strokeWidth: 2.5 });
    if (center)
      specs.push({ type: "text", text: center, fontSize: fit(center, 400, 30, 64), fontFamily: font, fontWeight: "900", fill: ink, cx: CC, cy: CC + 22, w: 440, charSpacing: 0 });
    if (bottom)
      specs.push({ type: "text", text: bottom, fontSize: fit(bottom, 190, 15, 24), fontFamily: font, fontWeight: "400", fill: ink, cx: CC, cy: CC + 82, w: 440, charSpacing: 0 });
  } else {
    specs.push(
      { type: "circle", r: 250, cx: CC, cy: CC, stroke: ink, strokeWidth: 8 },
      { type: "circle", r: 228, cx: CC, cy: CC, stroke: ink, strokeWidth: 2.5 }
    );
    if (name)
      specs.push({ type: "arc", text: name, radius: 200, position: "top", fontSize: fit(name, 300, 22, 40), fontFamily: font, fontWeight: "700", fill: ink, letterSpacing: 2, cx: CC, cy: CC });
    if (bottom)
      specs.push({ type: "arc", text: bottom, radius: 200, position: "bottom", fontSize: fit(bottom, 230, 18, 30), fontFamily: font, fontWeight: "700", fill: ink, letterSpacing: 3, cx: CC, cy: CC });
    specs.push(
      { type: "star", outer: 16, inner: 7, points: 5, cx: CC - 150, cy: CC, fill: ink, stroke: ink, strokeWidth: 0 },
      { type: "star", outer: 16, inner: 7, points: 5, cx: CC + 150, cy: CC, fill: ink, stroke: ink, strokeWidth: 0 }
    );
    if (center)
      specs.push({ type: "text", text: center, fontSize: fit(center, 420, 30, 62), fontFamily: font, fontWeight: "900", fill: ink, cx: CC, cy: CC, w: 360, charSpacing: 0 });
  }

  history.lock();
  canvas.remove(...canvas.getObjects());
  specs.forEach((sp) => canvas.add(spec(sp)));
  canvas.discardActiveObject();
  canvas.requestRenderAll();
  history.unlock();
  S().commit();
  S().syncSelection();
  S().setDesignName(name || center || "Generated stamp");
  S().toast("Stamp generated — every layer stays editable", "success");
}
