// LocalStorage persistence layer: design gallery + autosave buffer.

const DESIGN_KEY = "stamp_designs";
const AUTOSAVE_KEY = "stamp_autosave";
const THEME_KEY = "stamp_theme";
const PREFS_KEY = "stamp_prefs";

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn("storage write failed", e);
    return false;
  }
};

export const getDesigns = () => read(DESIGN_KEY, []);

export function saveDesign({ id, name, json, thumb }) {
  const designs = getDesigns();
  const now = Date.now();
  const existing = designs.findIndex((d) => d.id === id);
  const record = {
    id: id || `d_${now}_${Math.random().toString(36).slice(2, 7)}`,
    name: name || "Untitled stamp",
    json,
    thumb,
    created: existing >= 0 ? designs[existing].created : now,
    updated: now,
  };
  if (existing >= 0) designs[existing] = record;
  else designs.unshift(record);
  write(DESIGN_KEY, designs.slice(0, 40));
  return record;
}

export function deleteDesign(id) {
  write(
    DESIGN_KEY,
    getDesigns().filter((d) => d.id !== id)
  );
  return getDesigns();
}

export function renameDesign(id, name) {
  const designs = getDesigns().map((d) => (d.id === id ? { ...d, name } : d));
  write(DESIGN_KEY, designs);
  return designs;
}

export const writeAutosave = (json) =>
  write(AUTOSAVE_KEY, { json, at: Date.now() });
export const readAutosave = () => read(AUTOSAVE_KEY, null);
export const clearAutosave = () => localStorage.removeItem(AUTOSAVE_KEY);

export const getTheme = () => localStorage.getItem(THEME_KEY) || "dark";
export const setTheme = (t) => localStorage.setItem(THEME_KEY, t);

export const getPrefs = () => read(PREFS_KEY, {});
export const setPrefs = (p) => write(PREFS_KEY, { ...getPrefs(), ...p });
