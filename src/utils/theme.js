const HEX = /^#([0-9a-f]{6})$/i;

function rgb(hex) {
  const n = hex.replace("#", "");
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
  };
}

function mix(aHex, bHex, t) {
  const a = rgb(aHex);
  const b = rgb(bHex);
  const m = (x, y) => Math.round(x + (y - x) * t)
    .toString(16)
    .padStart(2, "0");
  return `#${m(a.r, b.r)}${m(a.g, b.g)}${m(a.b, b.b)}`;
}

function luminance(hex) {
  const { r, g, b } = rgb(hex);
  const lin = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export const DEFAULT_ACCENT = "#c4a574";

export const CORNER_PRESETS = {
  square: { radius: "0px", radiusLg: "0px" },
  soft: { radius: "8px", radiusLg: "12px" },
  round: { radius: "14px", radiusLg: "20px" },
};

export function applyCorners(style = "soft") {
  const preset = CORNER_PRESETS[style] || CORNER_PRESETS.soft;
  const root = document.documentElement;
  root.style.setProperty("--radius", preset.radius);
  root.style.setProperty("--radius-lg", preset.radiusLg);
  root.dataset.corners = CORNER_PRESETS[style] ? style : "soft";
  return style;
}

export function resolveTheme(theme) {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  return theme === "light" ? "light" : "dark";
}

export function applyThemeClass(theme) {
  const resolved = resolveTheme(theme);
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.classList.toggle("light", resolved === "light");
  return resolved;
}

export function applyAccent(hex) {
  const color = HEX.test(hex || "") ? hex : DEFAULT_ACCENT;
  const root = document.documentElement;
  const light = root.classList.contains("light");
  const on = luminance(color) > 0.48 ? "#1a1612" : "#faf6ef";
  const dim = mix(color, light ? "#f7f3eb" : "#1c1a17", 0.82);
  const soft = mix(color, "#ffffff", light ? 0.08 : 0.22);
  root.style.setProperty("--accent", color);
  root.style.setProperty("--accent-soft", soft);
  root.style.setProperty("--accent-dim", dim);
  root.style.setProperty("--on-accent", on);
  return color;
}
