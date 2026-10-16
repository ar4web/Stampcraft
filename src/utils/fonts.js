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
  { script: "Arabic", fonts: ["Cairo", "Amiri", "Tajawal"] },
  { script: "CJK", fonts: ["Noto Sans SC", "Noto Serif JP", "Noto Sans KR"] },
  {
    script: "Devanagari",
    fonts: ["Noto Sans Devanagari", "Hind", "Tiro Devanagari Hindi"],
  },
  { script: "Thai", fonts: ["Sarabun", "Kanit", "Prompt"] },
];

export const ALL_FONTS = FONT_SETS.flatMap((s) =>
  s.fonts.map((f) => ({ family: f, script: s.script }))
);

const loaded = new Set(["Inter", "Oswald", "Playfair Display", "Roboto Mono"]);

function injectLink(family) {
  const id = "gf-" + family.replace(/\s+/g, "-").toLowerCase();
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family
  ).replace(/%20/g, "+")}:wght@400;700&display=swap`;
  document.head.appendChild(link);
}

/** Loads a Google font and resolves once glyphs are really available. */
export async function loadFont(family) {
  if (!family) return false;
  try {
    injectLink(family);
    if (document.fonts && document.fonts.load) {
      await Promise.all([
        document.fonts.load(`400 24px "${family}"`),
        document.fonts.load(`700 24px "${family}"`),
      ]);
      await document.fonts.ready;
    }
    loaded.add(family);
    return true;
  } catch (e) {
    console.warn("font load failed", family, e);
    return false;
  }
}

/** Preloads the default working set before the canvas renders text. */
export async function preloadDefaults() {
  await Promise.all(
    ["Inter", "Oswald", "Playfair Display", "Roboto Mono"].map(loadFont)
  );
  if (document.fonts) await document.fonts.ready;
  return true;
}

export const isFontLoaded = (f) => loaded.has(f);
