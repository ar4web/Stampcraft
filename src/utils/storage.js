// LocalStorage persistence layer: design gallery + autosave buffer.
//
// IMPORTANT: every access goes through this adapter. In sandboxed iframes,
// private windows, or browsers with cookies/storage blocked, touching
// localStorage throws a SecurityError — and because the store reads the
// theme at startup, a single throw would prevent the whole app from
// loading. The adapter detects that once and falls back to memory, so
// the app always boots; persistence simply becomes session-only.

const DESIGN_KEY = "stamp_designs";
const AUTOSAVE_KEY = "stamp_autosave";
const THEME_KEY = "stamp_theme";
const PREFS_KEY = "stamp_prefs";
const CLIP_KEY = "stamp_clips";

const memory = new Map();

function detectStorage() {
  try {
    const test = "__stampcraft_test__";
    window.localStorage.setItem(test, "1");
    window.localStorage.removeItem(test);
    return window.localStorage;
  } catch {
    return null;
  }
}

const backend = detectStorage();

export const storageAvailable = () => !!backend;

const rawGet = (key) => {
  try {
    if (backend) return backend.getItem(key);
  } catch {
    /* fall through to memory */
  }
  return memory.has(key) ? memory.get(key) : null;
};

const rawSet = (key, value) => {
  memory.set(key, value);
  try {
    if (backend) backend.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

const read = (key, fallback) => {
  try {
    const raw = rawGet(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const write = (key, value) => {
  try {
    return rawSet(key, JSON.stringify(value));
  } catch {
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

export const getTheme = () => {
  try {
    return rawGet(THEME_KEY) || "dark";
  } catch {
    return "dark";
  }
};

export const setTheme = (t) => {
  try {
    rawSet(THEME_KEY, t);
  } catch {
    /* session-only */
  }
};

export const getPrefs = () => read(PREFS_KEY, {});
export const setPrefs = (p) => write(PREFS_KEY, { ...getPrefs(), ...p });

export const getClips = () => read(CLIP_KEY, []);

export function saveClip({ id, name, json, thumb }) {
  const clips = getClips();
  const now = Date.now();
  const record = {
    id: id || `c_${now}_${Math.random().toString(36).slice(2, 7)}`,
    name: name || "Clip",
    json,
    thumb,
    created: now,
  };
  clips.unshift(record);
  write(CLIP_KEY, clips.slice(0, 24));
  return record;
}

export function deleteClip(id) {
  write(
    CLIP_KEY,
    getClips().filter((c) => c.id !== id)
  );
  return getClips();
}

export const clearAutosave = () => {
  try {
    if (backend) backend.removeItem(AUTOSAVE_KEY);
  } catch {
    /* ignore */
  }
  memory.delete(AUTOSAVE_KEY);
};

export const resetPrefs = () => {
  try {
    if (backend) {
      backend.removeItem(PREFS_KEY);
      backend.removeItem(THEME_KEY);
    }
  } catch {
    /* ignore */
  }
  memory.delete(PREFS_KEY);
  memory.delete(THEME_KEY);
};

export function storageStatus() {
  const autosave = readAutosave();
  const designs = getDesigns();
  let used = 0;
  try {
    if (backend) {
      for (let i = 0; i < backend.length; i++) {
        const k = backend.key(i);
        if (k && k.startsWith("stamp_")) used += (backend.getItem(k) || "").length;
      }
    }
  } catch {
    /* ignore */
  }
  return {
    persistent: storageAvailable(),
    designs: designs.length,
    autosave: !!(autosave && autosave.json && (autosave.json.objects || []).length),
    autosaveAt: autosave?.at || null,
    usedKb: Math.round(used / 1024),
  };
}
