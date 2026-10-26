export function toHexColor(value) {
  if (typeof value !== "string") return null;
  const s = value.trim();
  if (/^#([0-9a-f]{6})$/i.test(s)) return s.toLowerCase();
  if (/^#([0-9a-f]{3})$/i.test(s)) {
    const r = s[1];
    const g = s[2];
    const b = s[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  const m = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (!m) return null;
  const h = (n) => Number(n).toString(16).padStart(2, "0");
  return `#${h(m[1])}${h(m[2])}${h(m[3])}`.toLowerCase();
}

export function objectInkHex(obj) {
  if (!obj) return null;
  const meta = obj.stampMeta || {};
  if (meta.ink && toHexColor(meta.ink)) return toHexColor(meta.ink);
  if (meta.kind === "arc" && meta.fill) return toHexColor(meta.fill);
  const fill = toHexColor(obj.fill);
  if (fill) return fill;
  const stroke = toHexColor(obj.stroke);
  if (stroke) return stroke;
  if (obj.type === "group" && obj.forEachObject) {
    let found = null;
    obj.forEachObject((ch) => {
      if (!found) found = objectInkHex(ch);
    });
    return found;
  }
  return null;
}
