import {
  Canvas,
  Circle,
  Ellipse,
  FabricImage,
  FabricText,
  Group,
  Line,
  Path,
  Polygon,
  Rect,
  Textbox,
  loadSVGFromString,
  util,
} from "fabric";
import { distressCanvasElement, stampifyCanvasElement } from "./texture";

export const CANVAS_SIZE = 620;
export const SNAP_TOLERANCE = 10;

export const INK_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "Midnight", hex: "#1a1a2e" },
  { name: "Blood Red", hex: "#8b0000" },
  { name: "Navy", hex: "#003366" },
  { name: "Forest", hex: "#006400" },
  { name: "Indigo", hex: "#4b0082" },
];

export const EXTRA_PROPS = [
  "stampMeta",
  "lockedLayer",
  "name",
  "id",
  "selectable",
  "evented",
  "visible",
  "strokeUniform",
];

let uid = 0;
export const nextId = () => `o_${Date.now().toString(36)}_${uid++}`;

/* ------------------------------------------------------------------ */
/* init                                                                */
/* ------------------------------------------------------------------ */

export function initCanvas(el) {
  const canvas = new Canvas(el, {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    backgroundColor: undefined,
    preserveObjectStacking: true,
    selection: true,
    stopContextMenu: true,
    fireRightClick: true,
    enableRetinaScaling: true,
  });
  canvas.setDimensions({ width: CANVAS_SIZE, height: CANVAS_SIZE });

  const guides = { v: false, h: false };

  canvas.on("object:moving", (e) => {
    const obj = e.target;
    if (!obj) return;
    const c = obj.getCenterPoint();
    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;
    guides.v = Math.abs(c.x - cx) < SNAP_TOLERANCE;
    guides.h = Math.abs(c.y - cy) < SNAP_TOLERANCE;
    if (guides.v) obj.set({ left: obj.left + (cx - c.x) });
    if (guides.h) obj.set({ top: obj.top + (cy - c.y) });
    obj.setCoords();
  });

  const clearGuides = () => {
    guides.v = false;
    guides.h = false;
    canvas.requestRenderAll();
  };
  canvas.on("mouse:up", clearGuides);
  canvas.on("object:modified", clearGuides);

  canvas.on("after:render", (e) => {
    if (!guides.v && !guides.h) return;
    const ctx = (e && e.ctx) || canvas.getContext();
    if (!ctx) return;
    const vpt = canvas.viewportTransform;
    const r = canvas.getRetinaScaling ? canvas.getRetinaScaling() : 1;
    ctx.save();
    ctx.setTransform(
      vpt[0] * r,
      vpt[1] * r,
      vpt[2] * r,
      vpt[3] * r,
      vpt[4] * r,
      vpt[5] * r
    );
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 1 / canvas.getZoom();
    ctx.setLineDash([6 / canvas.getZoom(), 5 / canvas.getZoom()]);
    if (guides.v) {
      ctx.beginPath();
      ctx.moveTo(CANVAS_SIZE / 2, 0);
      ctx.lineTo(CANVAS_SIZE / 2, CANVAS_SIZE);
      ctx.stroke();
    }
    if (guides.h) {
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_SIZE / 2);
      ctx.lineTo(CANVAS_SIZE, CANVAS_SIZE / 2);
      ctx.stroke();
    }
    ctx.restore();
  });

  return canvas;
}

export function styleSelection(canvas, accent = "#6366f1") {
  canvas.selectionColor = "rgba(99,102,241,0.12)";
  canvas.selectionBorderColor = accent;
  canvas.selectionLineWidth = 1;
}

/* ------------------------------------------------------------------ */
/* arc text                                                            */
/* ------------------------------------------------------------------ */

export const DEFAULT_ARC = {
  text: "COMPANY NAME",
  radius: 220,
  fontSize: 34,
  fontFamily: "Oswald",
  fontWeight: "700",
  fill: "#000000",
  letterSpacing: 2,
  position: "top", // top | bottom
  cx: CANVAS_SIZE / 2,
  cy: CANVAS_SIZE / 2,
};

export function makeArcText(options = {}) {
  const o = { ...DEFAULT_ARC, ...options };
  const chars = Array.from(String(o.text || " "));
  const glyphs = chars.map(
    (ch) =>
      new FabricText(ch === " " ? "\u00A0" : ch, {
        fontSize: o.fontSize,
        fontFamily: o.fontFamily,
        fontWeight: o.fontWeight,
        fill: o.fill,
        originX: "center",
        originY: "center",
        objectCaching: false,
      })
  );
  const widths = glyphs.map((g) => g.width + Number(o.letterSpacing || 0));
  const total = widths.reduce((a, b) => a + b, 0);
  const radius = Math.max(20, Number(o.radius) || 100);
  const totalAngle = total / radius;
  const bottom = o.position === "bottom";

  let cursor = -totalAngle / 2;
  glyphs.forEach((g, i) => {
    const a = cursor + widths[i] / 2 / radius;
    cursor += widths[i] / radius;
    const deg = util.radiansToDegrees(a);
    if (bottom) {
      g.set({
        left: radius * Math.sin(a),
        top: radius * Math.cos(a),
        angle: -deg,
      });
    } else {
      g.set({
        left: radius * Math.sin(a),
        top: -radius * Math.cos(a),
        angle: deg,
      });
    }
    g.setCoords();
  });

  const group = new Group(glyphs, {
    originX: "center",
    originY: "center",
    left: o.cx,
    top: o.cy,
    objectCaching: false,
  });
  group.id = o.id || nextId();
  group.name = o.name || `Arc: ${String(o.text).slice(0, 14)}`;
  group.stampMeta = {
    kind: "arc",
    text: o.text,
    radius,
    fontSize: o.fontSize,
    fontFamily: o.fontFamily,
    fontWeight: o.fontWeight,
    fill: o.fill,
    letterSpacing: o.letterSpacing,
    position: o.position,
  };
  return group;
}

/** Rebuilds an arc group in place preserving transform + z-index. */
export function rebuildArc(canvas, group, patch) {
  const meta = { ...(group.stampMeta || {}), ...patch };
  const index = canvas.getObjects().indexOf(group);
  const next = makeArcText({
    ...meta,
    cx: group.left,
    cy: group.top,
    id: group.id,
    name: group.name,
  });
  next.set({
    angle: group.angle,
    scaleX: group.scaleX,
    scaleY: group.scaleY,
    opacity: group.opacity,
    flipX: group.flipX,
    flipY: group.flipY,
  });
  next.lockedLayer = group.lockedLayer;
  next.visible = group.visible;
  canvas.remove(group);
  canvas.insertAt(index < 0 ? canvas.getObjects().length : index, next);
  canvas.setActiveObject(next);
  canvas.requestRenderAll();
  return next;
}

/* ------------------------------------------------------------------ */
/* object factories                                                    */
/* ------------------------------------------------------------------ */

export function polygonPoints(sides, radius, rotation = -90) {
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const a = util.degreesToRadians(rotation + (360 / sides) * i);
    pts.push({ x: radius * Math.cos(a), y: radius * Math.sin(a) });
  }
  return pts;
}

export function starPoints(points, outer, inner) {
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = util.degreesToRadians(-90 + (180 / points) * i);
    pts.push({ x: r * Math.cos(a), y: r * Math.sin(a) });
  }
  return pts;
}

const baseProps = (s) => ({
  left: s.cx ?? CANVAS_SIZE / 2,
  top: s.cy ?? CANVAS_SIZE / 2,
  originX: "center",
  originY: "center",
  fill: s.fill ?? "transparent",
  stroke: s.stroke ?? "#000000",
  strokeWidth: s.strokeWidth ?? 4,
  strokeUniform: true,
  opacity: s.opacity ?? 1,
  angle: s.angle ?? 0,
  objectCaching: false,
});

/** Builds a fabric object from a declarative template/tool spec. */
export function createSpecObject(spec) {
  const s = { ...spec };
  let obj = null;
  switch (s.type) {
    case "circle":
      obj = new Circle({ ...baseProps(s), radius: s.r ?? 200 });
      break;
    case "ellipse":
      obj = new Ellipse({ ...baseProps(s), rx: s.rx ?? 220, ry: s.ry ?? 140 });
      break;
    case "rect":
      obj = new Rect({
        ...baseProps(s),
        width: s.w ?? 400,
        height: s.h ?? 220,
        rx: s.rx ?? 0,
        ry: s.rx ?? 0,
      });
      break;
    case "triangle":
      obj = new Polygon(polygonPoints(3, s.r ?? 180), baseProps(s));
      break;
    case "hexagon":
      obj = new Polygon(polygonPoints(6, s.r ?? 200, s.rotation ?? -90), baseProps(s));
      break;
    case "star":
      obj = new Polygon(
        starPoints(s.points ?? 5, s.outer ?? 220, s.inner ?? 95),
        baseProps(s)
      );
      break;
    case "polygon":
      obj = new Polygon(s.pts || polygonPoints(5, 150), baseProps(s));
      break;
    case "line":
      obj = new Line([s.x1, s.y1, s.x2, s.y2], {
        ...baseProps(s),
        left: (s.x1 + s.x2) / 2,
        top: (s.y1 + s.y2) / 2,
        fill: undefined,
      });
      break;
    case "path":
      obj = new Path(s.d, baseProps(s));
      break;
    case "arc":
      obj = makeArcText(s);
      break;
    case "text":
    default:
      obj = new Textbox(s.text ?? "TEXT", {
        ...baseProps(s),
        fill: s.fill ?? "#000000",
        stroke: s.stroke ?? null,
        strokeWidth: s.strokeWidth ?? 0,
        width: s.w ?? 340,
        fontSize: s.fontSize ?? 36,
        fontFamily: s.fontFamily ?? "Oswald",
        fontWeight: s.fontWeight ?? "700",
        fontStyle: s.fontStyle ?? "normal",
        charSpacing: s.charSpacing ?? 60,
        lineHeight: s.lineHeight ?? 1.15,
        textAlign: s.textAlign ?? "center",
        underline: !!s.underline,
        splitByGrapheme: false,
      });
      break;
  }
  if (!obj.id) obj.id = nextId();
  obj.name = s.name || defaultName(s.type, s.text);
  if (!obj.stampMeta) obj.stampMeta = { kind: s.type === "arc" ? "arc" : s.type };
  if (s.locked) {
    obj.lockedLayer = true;
    obj.selectable = false;
    obj.evented = false;
  }
  return obj;
}

function defaultName(type, text) {
  if (type === "text" || type === "arc")
    return `${type === "arc" ? "Arc" : "Text"}: ${String(text || "").slice(0, 14)}`;
  return (type || "shape").charAt(0).toUpperCase() + (type || "shape").slice(1);
}

/** Adds a shape plus an optional inner nested border offset by a gap. */
export function buildShapeWithDoubleBorder(spec, double, gap = 8) {
  const main = createSpecObject(spec);
  if (!double) return [main];
  const inner = { ...spec };
  if (spec.type === "circle") inner.r = Math.max(10, spec.r - gap);
  else if (spec.type === "ellipse") {
    inner.rx = Math.max(10, spec.rx - gap);
    inner.ry = Math.max(10, spec.ry - gap);
  } else if (spec.type === "rect") {
    inner.w = Math.max(20, spec.w - gap * 2);
    inner.h = Math.max(20, spec.h - gap * 2);
    inner.rx = Math.max(0, (spec.rx || 0) - gap / 2);
  } else if (spec.type === "hexagon" || spec.type === "triangle") {
    inner.r = Math.max(20, (spec.r || 200) - gap);
  } else if (spec.type === "star") {
    inner.outer = Math.max(20, (spec.outer || 220) - gap);
    inner.inner = Math.max(10, (spec.inner || 95) - gap / 2);
  }
  inner.strokeWidth = Math.max(1, (spec.strokeWidth || 4) - 2);
  inner.name = (spec.name || "Shape") + " (inner)";
  return [main, createSpecObject(inner)];
}

/* ------------------------------------------------------------------ */
/* templates                                                           */
/* ------------------------------------------------------------------ */

export function applyTemplate(canvas, template) {
  canvas.remove(...canvas.getObjects());
  const specs =
    typeof template.build === "function" ? template.build() : template.objects;
  specs.forEach((s) => canvas.add(createSpecObject(s)));
  canvas.discardActiveObject();
  canvas.requestRenderAll();
  return canvas;
}

/** Off-screen preview data URL for the template gallery. */
export async function renderTemplateThumb(template, size = 150, ink = "#111") {
  const { StaticCanvas } = await import("fabric");
  const sc = new StaticCanvas(undefined, {
    width: size,
    height: size,
    backgroundColor: undefined,
  });
  const specs =
    typeof template.build === "function" ? template.build() : template.objects;
  specs.forEach((s) => sc.add(createSpecObject(s)));
  const scale = size / CANVAS_SIZE;
  sc.setZoom(scale);
  sc.renderAll();
  const url = sc.toDataURL({ format: "png", multiplier: 1.6 });
  sc.dispose();
  return url;
}

/* ------------------------------------------------------------------ */
/* export                                                              */
/* ------------------------------------------------------------------ */

export function downloadURL(url, filename) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Temporarily resets zoom/viewport so renders always cover the full artboard. */
function withNeutralViewport(canvas, fn) {
  const vpt = [...canvas.viewportTransform];
  const w = canvas.getWidth();
  const h = canvas.getHeight();
  canvas.discardActiveObject();
  canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
  canvas.setDimensions({ width: CANVAS_SIZE, height: CANVAS_SIZE });
  canvas.renderAll();
  try {
    return fn();
  } finally {
    canvas.setDimensions({ width: w, height: h });
    canvas.setViewportTransform(vpt);
    canvas.renderAll();
  }
}

export function exportPNG(canvas, multiplier = 3, filename) {
  const url = withNeutralViewport(canvas, () =>
    canvas.toDataURL({
      format: "png",
      multiplier,
      enableRetinaScaling: false,
    })
  );
  const name = filename || `stamp-${Date.now()}.png`;
  downloadURL(url, name);
  return name;
}

export function exportSVG(canvas, filename) {
  const svg = withNeutralViewport(canvas, () =>
    canvas.toSVG({ suppressPreamble: false })
  );
  const url = URL.createObjectURL(
    new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
  );
  const name = filename || `stamp-${Date.now()}.svg`;
  downloadURL(url, name);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return name;
}

export function thumbnail(canvas, size = 170) {
  try {
    return withNeutralViewport(canvas, () =>
      canvas.toDataURL({
        format: "png",
        multiplier: size / CANVAS_SIZE,
        enableRetinaScaling: false,
      })
    );
  } catch {
    return null;
  }
}

export const serialize = (canvas) => canvas.toObject(EXTRA_PROPS);

export async function deserialize(canvas, json) {
  await canvas.loadFromJSON(json);
  canvas.getObjects().forEach((o) => {
    if (o.lockedLayer) {
      o.selectable = false;
      o.evented = false;
    }
  });
  canvas.requestRenderAll();
}

/* ------------------------------------------------------------------ */
/* images                                                              */
/* ------------------------------------------------------------------ */

export async function addImageFromFile(canvas, file, opts = {}) {
  const isSVG = file.type === "image/svg+xml" || /\.svg$/i.test(file.name);
  const text = await (isSVG ? file.text() : readAsDataURL(file));
  let obj;
  if (isSVG) {
    const { objects, options } = await loadSVGFromString(text);
    obj = util.groupSVGElements(objects.filter(Boolean), options);
  } else {
    obj = await FabricImage.fromURL(text, { crossOrigin: "anonymous" });
  }
  const max = CANVAS_SIZE * 0.45;
  const scale = Math.min(max / (obj.width || max), max / (obj.height || max), 3);
  obj.set({
    originX: "center",
    originY: "center",
    left: opts.left ?? CANVAS_SIZE / 2,
    top: opts.top ?? CANVAS_SIZE / 2,
    scaleX: scale,
    scaleY: scale,
  });
  obj.id = nextId();
  obj.name = file.name.slice(0, 22);
  obj.stampMeta = { kind: "image", src: isSVG ? "svg" : "raster" };
  canvas.add(obj);
  canvas.setActiveObject(obj);
  canvas.requestRenderAll();
  return obj;
}

const readAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

/* ------------------------------------------------------------------ */
/* ink texture                                                         */
/* ------------------------------------------------------------------ */

/** Replaces a layer with a distressed raster version of itself. */
export async function applyInkTexture(canvas, obj, intensity) {
  const meta = obj.stampMeta || {};
  const sourceJSON = meta.textureSource || obj.toObject(EXTRA_PROPS);
  const index = canvas.getObjects().indexOf(obj);

  // Rebuild the pristine layer off-screen, then erode it.
  const MULT = 2;
  const [clean] = await util.enlivenObjects([sourceJSON]);
  clean.set({ angle: 0, flipX: false, flipY: false });
  const el = clean.toCanvasElement({ multiplier: MULT });
  distressCanvasElement(el, intensity, Math.floor(intensity) + 7);
  const img = await FabricImage.fromURL(el.toDataURL("image/png"));

  const center = obj.getCenterPoint();
  const wasTextured = meta.kind === "textured";
  const fx = wasTextured
    ? (obj.scaleX || 1) * MULT
    : (obj.scaleX || 1) / (clean.scaleX || 1);
  const fy = wasTextured
    ? (obj.scaleY || 1) * MULT
    : (obj.scaleY || 1) / (clean.scaleY || 1);
  img.set({
    originX: "center",
    originY: "center",
    left: center.x,
    top: center.y,
    angle: obj.angle,
    opacity: obj.opacity,
    scaleX: fx / MULT,
    scaleY: fy / MULT,
  });
  img.id = obj.id;
  img.name = obj.name;
  img.stampMeta = { ...meta, kind: "textured", textureSource: sourceJSON, intensity };
  canvas.remove(obj);
  canvas.insertAt(index < 0 ? canvas.getObjects().length : index, img);
  canvas.setActiveObject(img);
  canvas.requestRenderAll();
  return img;
}

/** Restores a textured layer back to its original vector object. */
export async function removeInkTexture(canvas, obj) {
  const src = obj.stampMeta && obj.stampMeta.textureSource;
  if (!src) return obj;
  const index = canvas.getObjects().indexOf(obj);
  const [restored] = await util.enlivenObjects([src]);
  const center = obj.getCenterPoint();
  restored.set({
    originX: "center",
    originY: "center",
    left: center.x,
    top: center.y,
    angle: obj.angle,
    opacity: obj.opacity,
  });
  canvas.remove(obj);
  canvas.insertAt(index < 0 ? canvas.getObjects().length : index, restored);
  canvas.setActiveObject(restored);
  canvas.requestRenderAll();
  return restored;
}

/** Grayscale + high-contrast "stamp filter" for imported bitmaps. */
export async function applyStampFilter(canvas, obj, on) {
  if (!obj || obj.type !== "image") return obj;
  const meta = obj.stampMeta || {};
  if (on) {
    const original = meta.originalSrc || obj.getSrc();
    const el = document.createElement("canvas");
    const el2 = await loadImageEl(original);
    el.width = el2.naturalWidth;
    el.height = el2.naturalHeight;
    el.getContext("2d").drawImage(el2, 0, 0);
    stampifyCanvasElement(el, 150);
    await obj.setSrc(el.toDataURL("image/png"));
    obj.stampMeta = { ...meta, originalSrc: original, stampFilter: true };
  } else if (meta.originalSrc) {
    await obj.setSrc(meta.originalSrc);
    obj.stampMeta = { ...meta, stampFilter: false };
  }
  canvas.requestRenderAll();
  return obj;
}

const loadImageEl = (src) =>
  new Promise((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = src;
  });

/* ------------------------------------------------------------------ */
/* selection helpers                                                   */
/* ------------------------------------------------------------------ */

export function selectionKind(obj) {
  if (!obj) return null;
  if (obj.type === "activeselection") return "multi";
  const meta = obj.stampMeta || {};
  if (meta.kind === "arc") return "arc";
  if (meta.kind === "textured") return "textured";
  if (obj.type === "image") return "image";
  if (["textbox", "i-text", "text"].includes(obj.type)) return "text";
  if (obj.type === "group") return "group";
  return "shape";
}
