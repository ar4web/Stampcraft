export const MM_PER_INCH = 25.4;

export const PRINT_SIZES = [
  { id: "20", mm: 20, label: "20 mm", hint: "3/4 in" },
  { id: "25", mm: 25, label: "25 mm", hint: "1 in" },
  { id: "30", mm: 30, label: "30 mm", hint: "1.2 in" },
  { id: "38", mm: 38, label: "38 mm", hint: "1.5 in" },
  { id: "40", mm: 40, label: "40 mm", hint: "1.6 in" },
  { id: "50", mm: 50, label: "50 mm", hint: "2 in" },
];

export const PRINT_DPI = [150, 300, 600];
export const PRINT_BLEEDS = [0, 1, 2, 3];

export function mmToPx(mm, dpi) {
  return (Number(mm) / MM_PER_INCH) * Number(dpi);
}

export function inchToMm(inch) {
  return Number(inch) * MM_PER_INCH;
}

export function slugName(name, ext) {
  const base = String(name || "stamp")
    .trim()
    .replace(/[^\w]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "stamp";
  return ext ? `${base}.${ext}` : base;
}

function clamp01(n) {
  return Math.min(1, Math.max(0, n));
}

export function parseHex(hex) {
  const m = /^#([0-9a-f]{6})$/i.exec(hex || "");
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function toHex(r, g, b) {
  const h = (n) => Math.round(clamp01(n) * 255)
    .toString(16)
    .padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

export function rgbToCmyk(r, g, b) {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const k = 1 - Math.max(rr, gg, bb);
  if (k >= 0.999) return { c: 0, m: 0, y: 0, k: 1 };
  return {
    c: (1 - rr - k) / (1 - k),
    m: (1 - gg - k) / (1 - k),
    y: (1 - bb - k) / (1 - k),
    k,
  };
}

export function cmykToRgb(c, m, y, k) {
  return {
    r: 1 - Math.min(1, c * (1 - k) + k),
    g: 1 - Math.min(1, m * (1 - k) + k),
    b: 1 - Math.min(1, y * (1 - k) + k),
  };
}

export function cmykSafeHex(hex) {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
  const k = Math.min(1, cmyk.k + 0.08);
  const out = cmykToRgb(
    Math.min(0.92, cmyk.c),
    Math.min(0.92, cmyk.m),
    Math.min(0.92, cmyk.y),
    k
  );
  return toHex(out.r, out.g, out.b);
}

function recolor(obj, mapHex) {
  const patch = {};
  if (typeof obj.fill === "string" && obj.fill.startsWith("#")) patch.fill = mapHex(obj.fill);
  if (typeof obj.stroke === "string" && obj.stroke.startsWith("#")) patch.stroke = mapHex(obj.stroke);
  if (Object.keys(patch).length) obj.set(patch);
  if (obj.type === "group") obj.forEachObject?.((ch) => recolor(ch, mapHex));
}

export function withCmykSafe(canvas, fn) {
  const backup = [];
  const walk = (o) => {
    backup.push({ o, fill: o.fill, stroke: o.stroke });
    if (o.type === "group") o.forEachObject?.(walk);
  };
  canvas.getObjects().forEach(walk);
  canvas.getObjects().forEach((o) => recolor(o, cmykSafeHex));
  canvas.renderAll();
  try {
    return fn();
  } finally {
    backup.forEach(({ o, fill, stroke }) => o.set({ fill, stroke }));
    canvas.renderAll();
  }
}

export function printPixels(sizeMm, dpi, bleedMm = 0) {
  const art = Math.round(mmToPx(sizeMm, dpi));
  const bleed = Math.round(mmToPx(bleedMm, dpi));
  return { art, bleed, total: art + bleed * 2 };
}
