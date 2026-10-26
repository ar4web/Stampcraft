import { Path } from "fabric";
import { CANVAS_SIZE, nextId } from "./canvas";

function loadEl(src) {
  return new Promise((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = src;
  });
}

function drawToCanvas(srcEl) {
  const el = document.createElement("canvas");
  el.width = srcEl.naturalWidth || srcEl.width;
  el.height = srcEl.naturalHeight || srcEl.height;
  const ctx = el.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(srcEl, 0, 0);
  return { el, ctx };
}

function dist(data, i, r, g, b) {
  return Math.abs(data[i] - r) + Math.abs(data[i + 1] - g) + Math.abs(data[i + 2] - b);
}

/** Flood from edges: knock out the backdrop so the mark stays. */
export function knockoutCanvasElement(el, tolerance = 36) {
  const ctx = el.getContext("2d", { willReadFrequently: true });
  if (!ctx) return el;
  const img = ctx.getImageData(0, 0, el.width, el.height);
  const { data, width: w, height: h } = img;
  const seen = new Uint8Array(w * h);
  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const p = y * w + x;
    if (seen[p]) return;
    seen[p] = 1;
    stack.push(p);
  };
  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }
  const samples = [];
  [[0, 0], [w - 1, 0], [0, h - 1], [w - 1, h - 1], [w >> 1, 0]].forEach(([x, y]) => {
    const i = (y * w + x) * 4;
    samples.push([data[i], data[i + 1], data[i + 2]]);
  });
  while (stack.length) {
    const p = stack.pop();
    const i = p * 4;
    if (data[i + 3] === 0) continue;
    const x = p % w;
    const y = (p - x) / w;
    const near = samples.some(([r, g, b]) => dist(data, i, r, g, b) <= tolerance * 3);
    if (!near) continue;
    data[i + 3] = 0;
    push(x - 1, y);
    push(x + 1, y);
    push(x, y - 1);
    push(x, y + 1);
  }
  ctx.putImageData(img, 0, 0);
  return el;
}

export function tintCanvasElement(el, hex) {
  const rgb = /^#([0-9a-f]{6})$/i.exec(hex || "");
  if (!rgb) return el;
  const n = parseInt(rgb[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const ctx = el.getContext("2d", { willReadFrequently: true });
  if (!ctx) return el;
  const img = ctx.getImageData(0, 0, el.width, el.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const lum = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
    const k = 1 - lum;
    d[i] = Math.round(r * k);
    d[i + 1] = Math.round(g * k);
    d[i + 2] = Math.round(b * k);
  }
  ctx.putImageData(img, 0, 0);
  return el;
}

export async function processFabricImage(canvas, obj, fn) {
  if (!obj || obj.type !== "image") throw new Error("Select a logo image");
  const meta = obj.stampMeta || {};
  const original = meta.originalSrc || obj.getSrc();
  const srcEl = await loadEl(obj.getSrc());
  const { el } = drawToCanvas(srcEl);
  fn(el);
  await obj.setSrc(el.toDataURL("image/png"));
  obj.stampMeta = { ...meta, originalSrc: original, kind: "image" };
  canvas.requestRenderAll();
  return obj;
}

export async function removeImageBackground(canvas, obj, tolerance = 36) {
  const next = await processFabricImage(canvas, obj, (el) => knockoutCanvasElement(el, tolerance));
  next.stampMeta = { ...next.stampMeta, knockout: true };
  return next;
}

export async function tintFabricImage(canvas, obj, hex) {
  const next = await processFabricImage(canvas, obj, (el) => tintCanvasElement(el, hex));
  next.stampMeta = { ...next.stampMeta, ink: hex };
  return next;
}

function downsample(el, max) {
  const scale = Math.min(1, max / Math.max(el.width, el.height));
  if (scale >= 1) return el;
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(el.width * scale));
  out.height = Math.max(1, Math.round(el.height * scale));
  out.getContext("2d").drawImage(el, 0, 0, out.width, out.height);
  return out;
}

export function canvasToPathD(el, alphaMin = 40) {
  const ctx = el.getContext("2d", { willReadFrequently: true });
  const { data, width: w, height: h } = ctx.getImageData(0, 0, el.width, el.height);
  const parts = [];
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      const i = (y * w + x) * 4;
      if (data[i + 3] < alphaMin) {
        x++;
        continue;
      }
      let x2 = x + 1;
      while (x2 < w && data[(y * w + x2) * 4 + 3] >= alphaMin) x2++;
      parts.push(`M ${x} ${y} h ${x2 - x} v 1 h ${x - x2} z`);
      x = x2;
    }
  }
  return parts.join(" ");
}

export async function vectorizeImage(canvas, obj, fill = "#003399") {
  if (!obj || obj.type !== "image") throw new Error("Select a logo image");
  const srcEl = await loadEl(obj.getSrc());
  const { el } = drawToCanvas(srcEl);
  knockoutCanvasElement(el, 36);
  const small = downsample(el, 180);
  const d = canvasToPathD(small);
  if (!d) throw new Error("Nothing to convert — remove the background first");
  const path = new Path(d, {
    fill,
    stroke: null,
    strokeWidth: 0,
    originX: "center",
    originY: "center",
    objectCaching: true,
  });
  const max = CANVAS_SIZE * 0.42;
  const bw = path.width || small.width;
  const bh = path.height || small.height;
  const scale = Math.min(max / bw, max / bh, 4);
  const center = obj.getCenterPoint();
  path.set({
    left: center.x,
    top: center.y,
    angle: obj.angle || 0,
    opacity: obj.opacity ?? 1,
    scaleX: scale,
    scaleY: scale,
  });
  path.id = obj.id || nextId();
  path.name = (obj.name || "Logo").replace(/\.[a-z]+$/i, "");
  path.stampMeta = { kind: "shape", ink: fill, fromImage: true };
  const index = canvas.getObjects().indexOf(obj);
  canvas.remove(obj);
  canvas.insertAt(index < 0 ? canvas.getObjects().length : index, path);
  canvas.setActiveObject(path);
  canvas.requestRenderAll();
  return path;
}
