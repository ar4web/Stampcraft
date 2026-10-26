const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export const DATE_FORMATS = [
  { id: "DD MMM YYYY", label: "24 OCT 2026" },
  { id: "DD/MM/YYYY", label: "24/10/2026" },
  { id: "YYYY-MM-DD", label: "2026-10-24" },
  { id: "MMM DD, YYYY", label: "OCT 24, 2026" },
];

export function formatStampDate(format = "DD MMM YYYY", date = new Date()) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getFullYear());
  const mon = MONTHS[date.getMonth()];
  return String(format || "DD MMM YYYY")
    .replace("DD", dd)
    .replace("YYYY", yyyy)
    .replace("MMM", mon)
    .replace("MM", mm);
}

export function formatStampTime(date = new Date()) {
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function formatSerial(meta = {}) {
  const n = Number(meta.serialValue) || 1;
  const pad = Math.max(1, Number(meta.serialPad) || 4);
  return `${meta.serialPrefix ?? "NO. "}${String(n).padStart(pad, "0")}`;
}

export function fieldText(meta, date = new Date()) {
  if (!meta?.field) return null;
  if (meta.field === "date") return formatStampDate(meta.dateFormat, date);
  if (meta.field === "time") return formatStampTime(date);
  if (meta.field === "serial") return formatSerial(meta);
  if (meta.field === "datetime") {
    return `${formatStampDate(meta.dateFormat, date)}  ${formatStampTime(date)}`;
  }
  return null;
}

function setObjectText(obj, text) {
  if (!obj || text == null) return false;
  if (["textbox", "i-text", "text"].includes(obj.type)) {
    if (obj.text === text) return false;
    obj.set({ text });
    obj.setCoords?.();
    return true;
  }
  return false;
}

export function refreshLiveFields(canvas, { bumpSerial = false } = {}) {
  if (!canvas) return false;
  let changed = false;
  const now = new Date();
  canvas.getObjects().forEach((o) => {
    const meta = o.stampMeta;
    if (!meta?.field) return;
    if (bumpSerial && meta.field === "serial") {
      meta.serialValue = (Number(meta.serialValue) || 1) + 1;
    }
    if (setObjectText(o, fieldText(meta, now))) changed = true;
  });
  if (changed) canvas.requestRenderAll();
  return changed;
}

export function isFieldObject(obj) {
  return !!obj?.stampMeta?.field;
}
