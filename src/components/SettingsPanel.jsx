import { useMemo, useRef, useState } from "react";
import {
  Accessibility,
  Contrast,
  FolderOpen,
  Keyboard,
  LifeBuoy,
  Circle as CircleIcon,
  Monitor,
  Moon,
  Palette,
  Pencil,
  RotateCcw,
  Save,
  Square,
  Squircle,
  Sun,
  Trash2,
  Type,
  Upload,
} from "lucide-react";
import useStampStore from "../store/useStampStore";
import { addImageFromFile, applyStampFilter } from "../utils/canvas";
import { getCustomFonts, importFontFile, preloadDefaults, restoreCustomFonts } from "../utils/fonts";
import { renameDesign, storageStatus } from "../utils/storage";
import { Checkbox, Row, Slider } from "./ui";
import Tooltip from "./Tooltip";

const SECTIONS = [
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "access", label: "Access", icon: Accessibility },
  { id: "workspace", label: "Workspace", icon: Contrast },
  { id: "files", label: "Files", icon: FolderOpen },
  { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
  { id: "recovery", label: "Recovery", icon: LifeBuoy },
];

const CORNERS = [
  { id: "square", label: "Square", hint: "Sharp", icon: Square },
  { id: "soft", label: "Soft", hint: "8px", icon: Squircle },
  { id: "round", label: "Round", hint: "14px", icon: CircleIcon },
];

const SHORTCUTS = [
  { key: "Ctrl + K", desc: "Open preferences" },
  { key: "Ctrl + Z / Shift + Z", desc: "Undo / Redo" },
  { key: "Ctrl + D", desc: "Duplicate" },
  { key: "Delete", desc: "Delete selection" },
  { key: "Ctrl + S", desc: "Save design" },
  { key: "Ctrl + E", desc: "Export PNG" },
  { key: "Ctrl + N", desc: "Clear canvas" },
  { key: "Ctrl + A", desc: "Select all" },
  { key: "Ctrl + G / Shift + G", desc: "Group / Ungroup" },
  { key: "Ctrl + [ / ]", desc: "Layer order" },
  { key: "Arrows / Shift", desc: "Nudge 1px / 10px" },
  { key: "Wheel · Space", desc: "Zoom · Pan" },
];

const ACCENTS = [
  { name: "Brass", hex: "#c4a574" },
  { name: "Copper", hex: "#c48a62" },
  { name: "Gold", hex: "#d4b45a" },
  { name: "Olive", hex: "#8a9a6e" },
  { name: "Clay", hex: "#c46a5a" },
  { name: "Ink", hex: "#4a6a9a" },
  { name: "Stone", hex: "#8a8680" },
];

const OUTLINES = ["#c4a574", "#c45c5c", "#6e9a72", "#4a6a9a", "#ece7dc", "#2a261f"];

const THEMES = [
  { id: "dark", label: "Dark", hint: "Ink desk", icon: Moon },
  { id: "light", label: "Light", hint: "Paper desk", icon: Sun },
  { id: "system", label: "System", hint: "Match OS", icon: Monitor },
];

function Card({ title, hint, children }) {
  return (
    <section className="card space-y-3 p-3.5">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="label">{title}</h3>
        {hint && (
          <span className="text-[11px] font-medium" style={{ color: "var(--text-mute)" }}>
            {hint}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function StatusRow({ ok, label, detail, action }) {
  return (
    <div
      className="flex items-center gap-2.5 px-2.5 py-2"
      style={{
        borderRadius: "var(--radius)",
        border: "1px solid var(--border-soft)",
        background: "var(--bg-sunken)",
      }}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ background: ok ? "var(--ok)" : "var(--warn)" }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12px] font-medium">{label}</p>
        {detail && (
          <p className="truncate text-[11px]" style={{ color: "var(--text-mute)" }}>
            {detail}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export default function SettingsPanel() {
  const st = useStampStore();
  const [section, setSection] = useState("appearance");
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");
  const fontRef = useRef(null);
  const importRef = useRef(null);
  const status = useMemo(() => storageStatus(), [st.designs, section]);

  const onFont = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      const fam = await importFontFile(f);
      st.toast(`Imported font "${fam}"`, "success");
    } catch (err) {
      st.toast(err.message, "error");
    }
  };

  const onImport = async (files) => {
    const file = files?.[0];
    if (!file || !st.canvas) return;
    try {
      const obj = await addImageFromFile(st.canvas, file);
      if (obj.type === "image") await applyStampFilter(st.canvas, obj, true);
      st.commit();
      st.syncSelection();
      st.toast(`Imported ${file.name}`, "success");
    } catch (e) {
      st.toast(`Import failed: ${e.message}`, "error");
    }
  };

  const reloadFonts = async () => {
    await preloadDefaults();
    await restoreCustomFonts().catch(() => null);
    st.toast("Fonts reloaded", "success");
  };

  return (
    <>
      <nav className="settings-nav" role="tablist" aria-label="Preference sections">
        {SECTIONS.map((s) => {
          const on = section === s.id;
          const Icon = s.icon;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setSection(s.id)}
              className="settings-nav-btn"
            >
              <Icon size={14} aria-hidden />
              {s.label}
            </button>
          );
        })}
      </nav>

      <div className="scroll-thin flex-1 space-y-3 overflow-y-auto p-3.5">
        {section === "appearance" && (
          <>
            <Card title="Theme" hint="Desk colour">
              <div className="grid grid-cols-3 gap-1.5">
                {THEMES.map((t) => {
                  const on = st.theme === t.id;
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`btn flex-col h-auto py-2.5 ${on ? "btn-on" : ""}`}
                      aria-pressed={on}
                      onClick={() => st.applyTheme(t.id)}
                    >
                      <Icon size={15} aria-hidden />
                      <span className="text-[12px] font-semibold">{t.label}</span>
                      <span className="text-[10px] font-medium" style={{ color: "var(--text-mute)" }}>
                        {t.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card title="Accent" hint="Chrome only">
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-mute)" }}>
                UI highlight. Stamp ink stays on the canvas.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {ACCENTS.map((a) => (
                  <button
                    key={a.hex}
                    type="button"
                    title={a.name}
                    aria-label={`Accent ${a.name}`}
                    aria-pressed={st.accentColor === a.hex}
                    onClick={() => st.setAccentColor(a.hex)}
                    className="settings-swatch"
                    style={{ background: a.hex }}
                  />
                ))}
                <input
                  type="color"
                  className="h-8 w-10 shrink-0 cursor-pointer"
                  aria-label="Custom accent"
                  value={st.accentColor}
                  onChange={(e) => st.setAccentColor(e.target.value)}
                />
              </div>
            </Card>

            <Card title="Corners" hint="Chrome shape">
              <div className="grid grid-cols-3 gap-1.5">
                {CORNERS.map((c) => {
                  const on = st.uiRadius === c.id;
                  const Icon = c.icon;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className={`btn flex-col h-auto py-2.5 ${on ? "btn-on" : ""}`}
                      aria-pressed={on}
                      onClick={() => st.setUiRadius(c.id)}
                    >
                      <Icon size={15} aria-hidden />
                      <span className="text-[12px] font-semibold">{c.label}</span>
                      <span className="text-[10px] font-medium" style={{ color: "var(--text-mute)" }}>
                        {c.hint}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>
          </>
        )}

        {section === "access" && (
          <Card title="Comfort">
            <Checkbox
              label="Reduce motion"
              checked={st.a11y.reduceMotion}
              onChange={(v) => st.setA11y({ reduceMotion: v })}
              hint="Silences animations."
            />
            <Checkbox
              label="High contrast"
              checked={st.a11y.highContrast}
              onChange={(v) => st.setA11y({ highContrast: v })}
              hint="Bolder borders and text."
            />
            <Checkbox
              label="Large controls"
              checked={st.a11y.largeControls}
              onChange={(v) => st.setA11y({ largeControls: v })}
              hint="Bigger buttons and hitboxes."
            />
            <Checkbox
              label="Always show focus"
              checked={st.a11y.alwaysFocus}
              onChange={(v) => st.setA11y({ alwaysFocus: v })}
              hint="Persistent keyboard outline."
            />
          </Card>
        )}

        {section === "workspace" && (
          <>
            <Card title="Canvas aids">
              <Slider label="Grid pitch" value={st.gridSize} min={8} max={48} step={2} onChange={st.setGridSize} suffix="px" />
              <Slider
                label="Grid lines"
                value={Math.round(st.gridOpacity * 100)}
                min={5}
                max={90}
                step={5}
                onChange={(v) => st.setGridOpacity(v / 100)}
                suffix="%"
              />
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-mute)" }}>
                Toggle grid and rulers from the canvas corner.
              </p>
            </Card>

            <Card title="Selection">
              <Row label="Outline">
                <div className="flex flex-wrap items-center gap-2">
                  {OUTLINES.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      aria-label={`Outline ${hex}`}
                      aria-pressed={(st.selectionColor || "").toLowerCase() === hex.toLowerCase()}
                      onClick={() => st.setSelectionColor(hex)}
                      className="settings-swatch"
                      style={{ background: hex }}
                    />
                  ))}
                  <input
                    type="color"
                    className="h-8 w-10 shrink-0 cursor-pointer"
                    aria-label="Custom outline colour"
                    value={st.selectionColor}
                    onChange={(e) => st.setSelectionColor(e.target.value)}
                  />
                </div>
              </Row>
              <Slider
                label="Width"
                value={st.selectionBorderWidth}
                min={1}
                max={5}
                step={0.5}
                onChange={st.setSelectionBorderWidth}
                suffix="px"
              />
            </Card>

            <Card title="Type" hint="TTF · OTF · WOFF">
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-mute)" }}>
                Brand fonts stay in this browser and restore on reload.
              </p>
              <button type="button" className="btn w-full" onClick={() => fontRef.current?.click()}>
                <Upload size={13} aria-hidden /> Upload font
              </button>
              <input ref={fontRef} type="file" accept=".ttf,.otf,.woff,.woff2" className="hidden" onChange={onFont} />
            </Card>
          </>
        )}

        {section === "files" && (
          <>
            <Card title="Current stamp" hint={st.dirty ? "unsaved" : "saved"}>
              <Row label="Name">
                <input
                  className="field"
                  aria-label="Design name"
                  value={st.designName}
                  onChange={(e) => st.setDesignName(e.target.value)}
                />
              </Row>
              <div className="flex gap-1.5">
                <button type="button" className="btn btn-ok flex-1" onClick={() => st.saveCurrent()}>
                  <Save size={14} aria-hidden /> Save
                </button>
                <button type="button" className="btn flex-1" onClick={() => st.saveAsNew()}>
                  Copy
                </button>
              </div>
              <button type="button" className="btn w-full" onClick={() => importRef.current?.click()}>
                <Upload size={14} aria-hidden /> Import image
              </button>
              <input
                ref={importRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  onImport(e.target.files);
                  e.target.value = "";
                }}
              />
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-mute)" }}>
                PNG, JPG or SVG. Files stay in this browser.
              </p>
            </Card>

            <Card title="Library" hint={`${st.designs.length}`}>
              {!st.designs.length ? (
                <p className="py-6 text-center text-[12px]" style={{ color: "var(--text-mute)" }}>
                  No saved files yet. Save the current stamp to start a library.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {st.designs.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center gap-2.5 p-1.5"
                      style={{
                        borderRadius: "var(--radius)",
                        border: `1px solid ${d.id === st.currentDesignId ? "var(--accent)" : "var(--border-soft)"}`,
                        background: "var(--bg-sunken)",
                      }}
                    >
                      <div
                        className="checkerboard grid h-11 w-11 shrink-0 place-items-center overflow-hidden"
                        style={{ backgroundSize: "8px 8px", borderRadius: "var(--radius)" }}
                      >
                        {d.thumb ? (
                          <img src={d.thumb} alt="" className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-[11px]" style={{ color: "var(--text-mute)" }}>
                            —
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        {editing === d.id ? (
                          <input
                            autoFocus
                            className="field"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onBlur={() => {
                              renameDesign(d.id, draft || d.name);
                              st.refreshDesigns();
                              setEditing(null);
                            }}
                            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                          />
                        ) : (
                          <>
                            <p className="truncate text-[12px] font-semibold">{d.name}</p>
                            <p className="truncate text-[11px]" style={{ color: "var(--text-mute)" }}>
                              {new Date(d.updated).toLocaleString()}
                            </p>
                          </>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Tooltip label="Open" side="top">
                          <button type="button" className="btn btn-icon" aria-label="Open file" onClick={() => st.loadDesign(d.id)}>
                            <FolderOpen size={13} />
                          </button>
                        </Tooltip>
                        <Tooltip label="Rename" side="top">
                          <button
                            type="button"
                            className="btn btn-icon"
                            aria-label="Rename"
                            onClick={() => {
                              setEditing(d.id);
                              setDraft(d.name);
                            }}
                          >
                            <Pencil size={13} />
                          </button>
                        </Tooltip>
                        <Tooltip label="Delete" side="top">
                          <button type="button" className="btn btn-icon btn-danger" aria-label="Delete" onClick={() => st.removeDesign(d.id)}>
                            <Trash2 size={13} />
                          </button>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}

        {section === "shortcuts" && (
          <div className="card overflow-hidden">
            {SHORTCUTS.map((s, i) => (
              <div
                key={s.key}
                className="flex items-center justify-between gap-3 px-3 py-2"
                style={{ borderTop: i ? "1px solid var(--border-soft)" : "none" }}
              >
                <span className="text-[12px]" style={{ color: "var(--text-dim)" }}>
                  {s.desc}
                </span>
                <kbd
                  className="px-1.5 py-0.5 font-mono text-[10px] font-semibold"
                  style={{
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--border-soft)",
                    background: "var(--bg-sunken)",
                    color: "var(--text-dim)",
                  }}
                >
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>
        )}

        {section === "recovery" && (
          <>
            <Card title="Studio health">
              <div className="space-y-1.5">
                <StatusRow
                  ok={status.persistent}
                  label={status.persistent ? "Browser storage on" : "Storage blocked"}
                  detail={
                    status.persistent
                      ? `${status.usedKb} KB used · ${status.designs} saved stamps`
                      : "Session only — files will not survive a reload"
                  }
                />
                <StatusRow
                  ok={!!st.canvas}
                  label={st.canvas ? "Canvas ready" : "Canvas not mounted"}
                  detail={st.canvas ? "Artboard is live" : "Reload if the workspace is blank"}
                />
                <StatusRow
                  ok={!status.autosave}
                  label={status.autosave ? "Unsaved draft waiting" : "No leftover draft"}
                  detail={
                    status.autosave && status.autosaveAt
                      ? new Date(status.autosaveAt).toLocaleString()
                      : "Autosave buffer is empty"
                  }
                />
                <StatusRow
                  ok
                  label={`${getCustomFonts().length} custom fonts`}
                  detail="Imported faces restore on reload"
                />
              </div>
            </Card>

            <Card title="Recover">
              <button
                type="button"
                className="btn w-full"
                disabled={!status.autosave}
                onClick={() => st.restoreAutosave()}
              >
                Restore last session
              </button>
              <button type="button" className="btn w-full" onClick={reloadFonts}>
                <Type size={13} aria-hidden /> Reload fonts
              </button>
              <button
                type="button"
                className="btn w-full"
                onClick={() => st.setA11y({ reduceMotion: false, highContrast: false, largeControls: false, alwaysFocus: false })}
              >
                <Contrast size={13} aria-hidden /> Reset comfort options
              </button>
            </Card>

            <Card title="Reset" hint="Designs are kept">
              <button type="button" className="btn w-full" onClick={() => st.discardAutosave()} disabled={!status.autosave}>
                Clear draft session
              </button>
              <button type="button" className="btn w-full" onClick={() => window.location.reload()}>
                <RotateCcw size={13} aria-hidden /> Reload app
              </button>
              <button type="button" className="btn btn-danger w-full" onClick={() => st.resetStudioPrefs()}>
                <Trash2 size={13} aria-hidden /> Reset studio settings
              </button>
              <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-mute)" }}>
                Resetting settings keeps saved stamps.
              </p>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
