import { downloadURL } from "./canvas";
import { slugName } from "./print";

export const STAMP_VERSION = 1;
export const STAMP_TYPE = "stampcraft";

export function buildStampFile({ name, json, ink, canvasColor, company }) {
  return {
    version: STAMP_VERSION,
    type: STAMP_TYPE,
    name: name || "Untitled stamp",
    ink: ink || "#003399",
    canvasColor: canvasColor || "",
    json,
    company: company || null,
    exportedAt: Date.now(),
  };
}

export function parseStampFile(text) {
  let data;
  try {
    data = typeof text === "string" ? JSON.parse(text) : text;
  } catch {
    throw new Error("File is not valid JSON");
  }
  if (!data || data.type !== STAMP_TYPE || !data.json) {
    throw new Error("Not a Stampcraft .stamp file");
  }
  return data;
}

export function downloadStampFile(data, name) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const filename = slugName(name || data.name || "stamp", "stamp");
  downloadURL(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return filename;
}

export function isStampFile(file) {
  if (!file) return false;
  return /\.stamp$/i.test(file.name || "") || file.type === "application/json";
}
