// Dynamic Google Font loader with multi-script support.

export const FONT_SETS = [
  {
    script: "Latin",
    fonts: [
      "Inter",
      "Oswald",
      "Playfair Display",
      "Roboto Mono",
      "Montserrat",
      "Bebas Neue",
      "Archivo Black",
      "Cinzel",
      "Merriweather",
      "Courier Prime",
    ],
  },
  { script: "Cyrillic", fonts: ["Roboto", "PT Sans", "Ubuntu"] },
  { script: "Arabic", fonts: ["Cairo", "Amiri", "Tajawal", "Changa", "Almarai", "Reem Kufi"] },
  { script: "CJK", fonts: ["Noto Sans SC", "Noto Serif JP", "Noto Sans KR"] },
  {
    script: "Devanagari",
    fonts: ["Noto Sans Devanagari", "Hind", "Tiro Devanagari Hindi"],
  },
  { script: "Thai", fonts: ["Sarabun", "Kanit", "Prompt"] },
];

const loaded = new Set(["Inter", "Oswald", "Playfair Display", "Roboto Mono"]);

function injectLink(family) {
  const id = "gf-" + family.replace(/\s+/g, "-").toLowerCase();
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  // Request the full weight ramp so the thickness control has real options.
  // Google silently serves the nearest available weights per family.
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family
  ).replace(/%20/g, "+")}:wght@300;400;500;600;700;800;900&display=swap`;
  document.head.appendChild(link);
}

/** Loads a Google font and resolves once glyphs are really available. */
export async function loadFont(family) {
  if (!family) return false;
  try {
    injectLink(family);
    if (document.fonts && document.fonts.load) {
      await Promise.all(
        ["300", "400", "500", "700", "900"].map((w) =>
          document.fonts.load(`${w} 24px "${family}"`)
        )
      );
      await document.fonts.ready;
    }
    loaded.add(family);
    return true;
  } catch (e) {
    console.warn("font load failed", family, e);
    return false;
  }
}

/** Picks a stamp font from the typed script. No language picker. */
export function fontForScript(text) {
  const t = text || "";
  if (/[\u0600-\u06FF]/.test(t)) return "Cairo";
  if (/[\u0400-\u04FF]/.test(t)) return "PT Sans";
  if (/[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/.test(t)) return "Noto Sans SC";
  if (/[\u0900-\u097F]/.test(t)) return "Noto Sans Devanagari";
  if (/[\u0E00-\u0E7F]/.test(t)) return "Sarabun";
  return "Oswald";
}

/** Preloads the default working set before the canvas renders text. */
export async function preloadDefaults() {
  await Promise.all(
    ["Inter", "Oswald", "Playfair Display", "Roboto Mono"].map(loadFont)
  );
  if (document.fonts) await document.fonts.ready;
  return true;
}

/* ------------------------------------------------------------------ */
/* custom user fonts                                                   */
/* ------------------------------------------------------------------ */

const CUSTOM_KEY = "stamp_custom_fonts";
const customFonts = [];

const readCustom = () => {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]");
  } catch {
    return [];
  }
};

/** Registers a font from a data URL via the FontFace API. */
async function register(family, dataUrl) {
  const face = new FontFace(family, `url(${dataUrl})`);
  await face.load();
  document.fonts.add(face);
  loaded.add(family);
  if (!customFonts.includes(family)) customFonts.push(family);
  return family;
}

/** Imports a .ttf/.otf/.woff/.woff2 file the user picked. */
export async function importFontFile(file) {
  if (!/\.(ttf|otf|woff2?)$/i.test(file.name))
    throw new Error("Use a TTF, OTF, WOFF or WOFF2 file");
  if (file.size > 6 * 1024 * 1024) throw new Error("Font must be under 6 MB");

  const dataUrl = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

  const family = file.name.replace(/\.(ttf|otf|woff2?)$/i, "").slice(0, 40);
  await register(family, dataUrl);

  // Persist so the font survives a reload (fonts are small enough to store).
  try {
    const all = readCustom().filter((f) => f.family !== family);
    all.push({ family, dataUrl });
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(all));
  } catch {
    // quota exceeded — font still works for this session
  }
  return family;
}

/** Re-registers every previously imported font on page load. */
export async function restoreCustomFonts() {
  const all = readCustom();
  await Promise.all(
    all.map((f) => register(f.family, f.dataUrl).catch(() => null))
  );
  return getCustomFonts();
}

export const getCustomFonts = () => [...customFonts];

