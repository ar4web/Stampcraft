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
import { isRTL, toVisualClusters } from "./arabic";
import { fieldText } from "./fields";
import { printPixels, slugName, withCmykSafe } from "./print";

export const CANVAS_SIZE = 620;
export const SNAP_TOLERANCE = 10;

export const INK_COLORS = [
  { name: "Stamp Blue", hex: "#003399" },
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
  "direction",
];

/** Stamp surface colours offered in the bottom bar. */
export const CANVAS_COLORS = [
  { name: "Transparent", hex: "" },
  { name: "White", hex: "#ffffff" },
  { name: "Cream", hex: "#faf3e0" },
  { name: "Kraft", hex: "#d9bf9b" },
  { name: "Slate", hex: "#cfd6e4" },
];

/** Sets the exported stamp surface colour ("" === transparent). */
export function setCanvasColor(canvas, hex) {
  if (!canvas) return;
  canvas.backgroundColor = hex || undefined;
  canvas.requestRenderAll();
}

let uid = 0;
export const nextId = () => `o_${Date.now().toString(36)}_${uid++}`;

/* ------------------------------------------------------------------ */
/* init                                                                */
/* ------------------------------------------------------------------ */

export function initCanvas(el, prefs = {}) {
  const canvas = new Canvas(el, {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    backgroundColor: undefined,
    preserveObjectStacking: true,
    selection: true,
    stopContextMenu: true,
    fireRightClick: true,
    enableRetinaScaling: true,
    selectionColor: prefs.selectionColor || "rgba(245,158,11,0.14)",
    selectionBorderColor: prefs.selectionColor || "#f59e0b",
    selectionLineWidth: prefs.selectionBorderWidth ?? 1,
  });
  canvas.setDimensions({ width: CANVAS_SIZE, height: CANVAS_SIZE });
  enableMouseRotate(canvas, prefs.selectionColor || "#8d7a5a");

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
    ctx.strokeStyle = "#f59e0b";
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

function enableMouseRotate(canvas, accent) {
  const paint = (obj) => {
    if (!obj || obj.lockMovementX === undefined && !obj.type) return;
    obj.set({
      lockRotation: false,
      centeredRotation: true,
      transparentCorners: false,
      cornerStyle: "rect",
      cornerSize: 8,
      touchCornerSize: 22,
      padding: 10,
      borderColor: accent,
      cornerColor: accent,
      cornerStrokeColor: "#1a1b1c",
      borderScaleFactor: 1,
    });
    if (obj.controls?.mtr) {
      obj.controls.mtr.offsetY = -36;
      obj.controls.mtr.withConnection = true;
      obj.controls.mtr.sizeX = 16;
      obj.controls.mtr.sizeY = 16;
      obj.controls.mtr.cursorStyle = "crosshair";
    }
  };
  const paintAll = (list) => (list || []).forEach(paint);
  canvas.getObjects().forEach(paint);
  if (canvas.__stampRotateWired) return;
  canvas.__stampRotateWired = true;
  canvas.on("object:added", (e) => paint(e.target));
  canvas.on("selection:created", (e) => paintAll(e.selected));
  canvas.on("selection:updated", (e) => paintAll(e.selected));
}

export function styleSelection(canvas, accent = "#8d7a5a") {
  canvas.selectionColor = "rgba(141,122,90,0.16)";
  canvas.selectionBorderColor = accent;
  canvas.selectionLineWidth = 1;
  enableMouseRotate(canvas, accent);
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
  fill: "#003399",
  letterSpacing: 2,
  position: "top", // top | bottom
  cx: CANVAS_SIZE / 2,
  cy: CANVAS_SIZE / 2,
};

export function makeArcText(options = {}) {
  const o = { ...DEFAULT_ARC, ...options };
  // Arabic is shaped + reversed here so letters stay joined on the curve.
  const chars = toVisualClusters(String(o.text || " "));
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
    objectCaching: true,
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
  stroke: s.stroke ?? "#003399",
  strokeWidth: s.strokeWidth ?? 4,
  strokeDashArray: s.strokeDashArray ?? null,
  strokeUniform: true,
  opacity: s.opacity ?? 1,
  angle: s.angle ?? 0,
  objectCaching: true,
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
    default: {
      // Fabric draws glyph-by-glyph whenever charSpacing != 0, which breaks
      // Arabic cursive joining — so RTL runs are forced to zero spacing.
      const rtl = isRTL(s.text);
      obj = new Textbox(s.text ?? "TEXT", {
        ...baseProps(s),
        fill: s.fill ?? "#003399",
        stroke: s.stroke ?? null,
        strokeWidth: s.strokeWidth ?? 0,
        width: s.w ?? 340,
        fontSize: s.fontSize ?? 36,
        fontFamily: s.fontFamily ?? "Oswald",
        fontWeight: s.fontWeight ?? "700",
        fontStyle: s.fontStyle ?? "normal",
        charSpacing: rtl ? 0 : s.charSpacing ?? 60,
        lineHeight: s.lineHeight ?? 1.15,
        textAlign: s.textAlign ?? "center",
        direction: rtl ? "rtl" : "ltr",
        underline: !!s.underline,
        splitByGrapheme: false,
      });
      break;
    }
  }
  if (!obj.id) obj.id = nextId();
  obj.name = s.name || defaultName(s.type, s.text);
  if (!obj.stampMeta) obj.stampMeta = { kind: s.type === "arc" ? "arc" : s.type };
  if (s.field) {
    obj.stampMeta = {
      ...obj.stampMeta,
      field: s.field,
      dateFormat: s.dateFormat || "DD MMM YYYY",
      serialPrefix: s.serialPrefix ?? "NO. ",
      serialValue: s.serialValue ?? 1,
      serialPad: s.serialPad ?? 4,
    };
    const live = fieldText(obj.stampMeta);
    if (live && obj.set) obj.set({ text: live });
  }
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

/** Calculates the collective bounding box of all visible stamp objects on the canvas. */
export function getStampBounds(canvas, padding = 16) {
  const objs = canvas.getObjects().filter((o) => o.visible !== false);
  if (!objs.length) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  objs.forEach((o) => {
    const b = o.getBoundingRect();
    if (b.left < minX) minX = b.left;
    if (b.top < minY) minY = b.top;
    if (b.left + b.width > maxX) maxX = b.left + b.width;
    if (b.top + b.height > maxY) maxY = b.top + b.height;
  });
  if (minX === Infinity || maxX === -Infinity) return null;
  const left = Math.max(0, Math.floor(minX - padding));
  const top = Math.max(0, Math.floor(minY - padding));
  const right = Math.min(CANVAS_SIZE, Math.ceil(maxX + padding));
  const bottom = Math.min(CANVAS_SIZE, Math.ceil(maxY + padding));
  return {
    left,
    top,
    width: Math.max(20, right - left),
    height: Math.max(20, bottom - top),
  };
}

/**
 * Temporarily resets zoom/viewport so renders always cover the full artboard.
 * When transparentOnly is true (default), removes canvas background during export
 * so ONLY what is on the canvas (stamp artwork) is exported with transparent background.
 */
function withNeutralViewport(canvas, fn, { transparentOnly = true } = {}) {
  const vpt = [...canvas.viewportTransform];
  const w = canvas.getWidth();
  const h = canvas.getHeight();
  const originalBg = canvas.backgroundColor;
  canvas.discardActiveObject();
  
  if (transparentOnly) {
    canvas.backgroundColor = null;
  }
  canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
  canvas.setDimensions({ width: CANVAS_SIZE, height: CANVAS_SIZE });
  canvas.renderAll();
  try {
    return fn();
  } finally {
    canvas.backgroundColor = originalBg;
    canvas.setDimensions({ width: w, height: h });
    canvas.setViewportTransform(vpt);
    canvas.renderAll();
  }
}

function padBleedDataUrl(dataUrl, art, bleed, format, quality, background) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = art + bleed * 2;
      c.height = art + bleed * 2;
      const ctx = c.getContext("2d");
      if (format === "jpeg" || background) {
        ctx.fillStyle = background || "#ffffff";
        ctx.fillRect(0, 0, c.width, c.height);
      }
      ctx.drawImage(img, bleed, bleed, art, art);
      const mime = format === "jpeg" ? "image/jpeg" : "image/png";
      resolve(c.toDataURL(mime, quality));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

async function rasterExport(canvas, format, multiplier, filename, options = {}) {
  const transparentOnly = format === "jpeg" ? false : options.transparentOnly !== false;
  const trim = options.trim === true;
  const quality = options.quality ?? 0.92;
  const ext = format === "jpeg" ? "jpg" : format;
  const print = options.sizeMm && options.dpi
    ? printPixels(options.sizeMm, options.dpi, options.bleedMm || 0)
    : null;
  const mult = print ? print.art / CANVAS_SIZE : multiplier;

  const render = () =>
    withNeutralViewport(
      canvas,
      () => {
        const exportOpts = {
          format,
          multiplier: mult,
          enableRetinaScaling: false,
          quality,
        };
        if (trim) {
          const bounds = getStampBounds(canvas);
          if (bounds) {
            exportOpts.left = bounds.left;
            exportOpts.top = bounds.top;
            exportOpts.width = bounds.width;
            exportOpts.height = bounds.height;
          }
        }
        return canvas.toDataURL(exportOpts);
      },
      { transparentOnly }
    );

  let url = options.cmykSafe ? withCmykSafe(canvas, render) : render();
  if (print && print.bleed > 0) {
    url = await padBleedDataUrl(
      url,
      print.art,
      print.bleed,
      format,
      quality,
      transparentOnly ? null : canvas.backgroundColor || "#ffffff"
    );
  }
  const name = filename || slugName(options.name || `stamp-${Date.now()}`, ext);
  downloadURL(url, name);
  return name;
}

export function exportPNG(canvas, multiplier = 3, filename, options = {}) {
  return rasterExport(canvas, "png", multiplier, filename, options);
}

export function exportJPG(canvas, multiplier = 3, filename, options = {}) {
  return rasterExport(canvas, "jpeg", multiplier, filename, { ...options, transparentOnly: false });
}

export function exportSVG(canvas, filename, options = {}) {
  const transparentOnly = options.transparentOnly !== false;
  const render = () =>
    withNeutralViewport(
      canvas,
      () => canvas.toSVG({ suppressPreamble: false }),
      { transparentOnly }
    );
  const svg = options.cmykSafe ? withCmykSafe(canvas, render) : render();
  const url = URL.createObjectURL(
    new Blob([svg], { type: "image/svg+xml;charset=utf-8" })
  );
  const name = filename || slugName(options.name || `stamp-${Date.now()}`, "svg");
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
    const live = fieldText(o.stampMeta);
    if (live && ["textbox", "i-text", "text"].includes(o.type)) o.set({ text: live });
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

export function findRingShape(canvas, exclude) {
  const ranks = { circle: 4, ellipse: 3, rect: 2, polygon: 1 };
  const shapes = canvas.getObjects().filter((o) => {
    if (!o || o === exclude || o.visible === false) return false;
    return ranks[o.type] > 0;
  });
  if (!shapes.length) return null;
  return shapes.sort((a, b) => {
    const ba = a.getBoundingRect();
    const bb = b.getBoundingRect();
    const areaA = ba.width * ba.height;
    const areaB = bb.width * bb.height;
    if (areaB !== areaA) return areaB - areaA;
    return (ranks[b.type] || 0) - (ranks[a.type] || 0);
  })[0];
}

export function fitObjectInRing(canvas, obj, padExtra = 12) {
  const ring = findRingShape(canvas, obj);
  if (!ring || !obj) throw new Error("Add a frame first, then drop the logo");
  const b = ring.getBoundingRect(true);
  const pad = Math.max(ring.strokeWidth || 0, padExtra);
  const maxW = Math.max(24, b.width - pad * 2);
  const maxH = Math.max(24, b.height - pad * 2);
  const w = Math.max(1, obj.width || 1);
  const h = Math.max(1, obj.height || 1);
  const scale = Math.min(maxW / w, maxH / h);
  obj.set({
    originX: "center",
    originY: "center",
    left: b.left + b.width / 2,
    top: b.top + b.height / 2,
    scaleX: scale,
    scaleY: scale,
  });
  obj.setCoords();
  canvas.requestRenderAll();
  return ring;
}

export async function clipObjectToRing(canvas, obj) {
  const ring = fitObjectInRing(canvas, obj);
  const clip = await ring.clone();
  clip.set({
    absolutePositioned: true,
    fill: "#000000",
    stroke: null,
    strokeWidth: 0,
    opacity: 1,
  });
  obj.set({ clipPath: clip });
  obj.stampMeta = { ...(obj.stampMeta || {}), clippedToRing: true };
  canvas.requestRenderAll();
  return obj;
}

export function clearObjectClip(canvas, obj) {
  if (!obj) return obj;
  obj.set({ clipPath: undefined });
  if (obj.stampMeta) obj.stampMeta = { ...obj.stampMeta, clippedToRing: false };
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
export async function applyInkTexture(canvas, obj, intensity, mode = "distress") {
  const meta = obj.stampMeta || {};
  const sourceJSON = meta.textureSource || obj.toObject(EXTRA_PROPS);
  const index = canvas.getObjects().indexOf(obj);

  // Rebuild the pristine layer off-screen, then erode it.
  const MULT = 2;
  const [clean] = await util.enlivenObjects([sourceJSON]);
  clean.set({ angle: 0, flipX: false, flipY: false });
  const el = clean.toCanvasElement({ multiplier: MULT });
  distressCanvasElement(el, intensity, Math.floor(intensity) + 7, mode);
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
  img.stampMeta = { ...meta, kind: "textured", textureSource: sourceJSON, intensity, mode };
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

/* ------------------------------------------------------------------ */
/* straight <-> curved conversion (apply curve anywhere, anytime)      */
/* ------------------------------------------------------------------ */

/** Converts a placed text layer between straight and curved in place. */
export function toggleTextCurve(canvas, obj, opts = {}) {
  const kind = selectionKind(obj);
  const index = canvas.getObjects().indexOf(obj);
  const center = obj.getCenterPoint();
  let next = null;

  if (kind === "arc") {
    const meta = obj.stampMeta || {};
    next = createSpecObject({
      type: "text",
      text: meta.text || "",
      fontSize: meta.fontSize || 36,
      fontFamily: meta.fontFamily || "Oswald",
      fontWeight: String(meta.fontWeight || "700"),
      fill: meta.fill || "#003399",
      charSpacing: 0,
      cx: center.x,
      cy: center.y,
      w: Math.max(200, String(meta.text || "").length * (meta.fontSize || 36) * 0.72),
    });
  } else if (kind === "text") {
    next = makeArcText({
      text: obj.text || "",
      radius: opts.radius ?? 200,
      fontSize: obj.fontSize || 36,
      fontFamily: obj.fontFamily || "Oswald",
      fontWeight: String(obj.fontWeight || "700"),
      fill: obj.fill || "#003399",
      letterSpacing: 2,
      position: opts.position ?? "top",
      cx: center.x,
      cy: center.y,
    });
  } else {
    return obj;
  }

  next.set({ angle: obj.angle, opacity: obj.opacity });
  canvas.remove(obj);
  canvas.insertAt(index < 0 ? canvas.getObjects().length : index, next);
  canvas.setActiveObject(next);
  canvas.requestRenderAll();
  return next;
}
