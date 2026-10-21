import { useMemo, useRef, useState } from "react";
import {
  Contrast,
  FolderOpen,
  Grid3x3,
  Keyboard,
  LifeBuoy,
  Moon,
  Pencil,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Sun,
  Trash2,
  Type,
  Upload,
  Wrench,
} from "lucide-react";
import useStampStore from "../store/useStampStore";
import { addImageFromFile, applyStampFilter } from "../utils/canvas";
import { getCustomFonts, importFontFile, preloadDefaults, restoreCustomFonts } from "../utils/fonts";
import { renameDesign, storageStatus } from "../utils/storage";
import { Checkbox, Row, Slider } from "./ui";
import Tooltip from "./Tooltip";

const MODES = [
  { id: "setup", label: "Setup", icon: SlidersHorizontal },
  { id: "files", label: "Files", icon: FolderOpen },
  { id: "fix", label: "Fix", icon: Wrench },
];

const SHORTCUTS = [
  { key: "Ctrl + K", desc: "Open this panel" },
  { key: "Ctrl + Z / ⇧Z", desc: "Undo / Redo" },
  { key: "Ctrl + D", desc: "Duplicate" },
  { key: "Del", desc: "Delete" },
  { key: "Ctrl + S", desc: "Save design" },
  { key: "Ctrl + E", desc: "Export PNG" },
  { key: "Ctrl + N", desc: "Clear canvas" },
  { key: "Ctrl + A", desc: "Select all" },
  { key: "Ctrl + G / ⇧G", desc: "Group / Ungroup" },
  { key: "Ctrl + [ / ]", desc: "Layer order" },
  { key: "Arrows / ⇧", desc: "Nudge 1px / 10px" },
  { key: "Wheel · Space", desc: "Zoom · Pan" },
];

const ACCENTS = [
  { name: "Brass", hex: "#8d7a5a" },
  { name: "Copper", hex: "#8a6a52" },
  { name: "Gold", hex: "#8a7a52" },
  { name: "Olive", hex: "#6a7a62" },
  { name: "Clay", hex: "#8a5a52" },
  { name: "Stone", hex: "#6a6e72" },
  { name: "Slate", hex: "#5c6268" },
];

const OUTLINES = ["#8d7a5a", "#a35a5a", "#6a8a6e", "#6a6e72", "#c2c4c6", "#3a3b3c"];

function Card({ title, hint, children }) {
  return (
    <section className="card space-y-2 p-3">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="label">{title}</h3>
        {hint && (
          <span className="text-[9px] font-medium" style={{ color: "var(--text-mute)" }}>
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
      className="flex items-center gap-2 border px-2 py-1.5"
      style={{ borderColor: "var(--border-soft)", background: "var(--bg-sunken)" }}
    >
      <span
        className="h-1.5 w-1.5 shrink-0"
        style={{ background: ok ? "var(--ok)" : "var(--warn)" }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] font-medium">{label}</p>
        {detail && (
          <p className="truncate text-[9px]" style={{ color: "var(--text-mute)" }}>
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
  const [mode, setMode] = useState("setup");
  const [fixView, setFixView] = useState("health");
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");
  const fontRef = useRef(null);
  const importRef = useRef(null);
  const status = useMemo(() => storageStatus(), [st.designs, mode]);

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
    <div className="space-y-2.5">
      <div
        className="grid grid-cols-3 border"
        style={{ borderColor: "var(--border-soft)", background: "var(--bg-sunken)" }}
        role="tablist"
        aria-label="Studio setup"
      >
        {MODES.map((m) => {
          const on = mode === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setMode(m.id)}
              className="flex items-center justify-center gap-1.5 px-2 py-2 text-[10px] font-semibold"
              style={{
                background: on ? "var(--bg-raised)" : "transparent",
                color: on ? "var(--text)" : "var(--text-mute)",
                borderBottom: on ? "1px solid var(--border)" : "1px solid transparent",
              }}
            >
              <Icon size={12} aria-hidden />
              {m.label}
            </button>
          );
        })}
      </div>

      {mode === "setup" && (
        <div className="space-y-2.5">
          <Card title="Workspace" hint="First-run defaults">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                className={`btn ${st.theme === "dark" ? "btn-on" : ""}`}
                aria-pressed={st.theme === "dark"}
                onClick={() => st.applyTheme("dark")}
              >
                <Moon size={12} aria-hidden /> Dark
              </button>
              <button
                type="button"
                className={`btn ${st.theme === "light" ? "btn-on" : ""}`}
                aria-pressed={st.theme === "light"}
                onClick={() => st.applyTheme("light")}
              >
                <Sun size={12} aria-hidden /> Light
              </button>
            </div>
            <Row label="Accent">
              <div className="flex flex-wrap items-center gap-1.5">
                {ACCENTS.map((a) => (
                  <button
                    key={a.hex}
                    type="button"
                    title={a.name}
                    aria-label={`Accent ${a.name}`}
                    onClick={() => st.setAccentColor(a.hex)}
                    className="h-5 w-5 border"
                    style={{
                      background: a.hex,
                      borderColor: st.accentColor === a.hex ? "var(--text)" : "var(--border-soft)",
                    }}
                  />
                ))}
                <input
                  type="color"
                  className="h-5 w-8 shrink-0 cursor-pointer"
                  aria-label="Custom accent"
                  value={st.accentColor}
                  onChange={(e) => st.setAccentColor(e.target.value)}
                />
              </div>
            </Row>
          </Card>

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
            <p className="text-[9px] leading-relaxed" style={{ color: "var(--text-mute)" }}>
              Toggle grid and rulers from the canvas corner.
            </p>
          </Card>

          <Card title="Selection">
            <Row label="Outline">
              <div className="flex flex-wrap items-center gap-1.5">
                {OUTLINES.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    aria-label={`Outline ${hex}`}
                    onClick={() => st.setSelectionColor(hex)}
                    className="h-5 w-5 border"
                    style={{
                      background: hex,
                      borderColor:
                        (st.selectionColor || "").toLowerCase() === hex.toLowerCase()
                          ? "var(--text)"
                          : "var(--border-soft)",
                    }}
                  />
                ))}
                <input
                  type="color"
                  className="h-5 w-8 shrink-0 cursor-pointer"
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
            <p className="text-[9px] leading-relaxed" style={{ color: "var(--text-mute)" }}>
              Brand fonts stay in this browser and restore on reload.
            </p>
            <button type="button" className="btn w-full" onClick={() => fontRef.current?.click()}>
              <Upload size={12} aria-hidden /> Upload font
            </button>
            <input ref={fontRef} type="file" accept=".ttf,.otf,.woff,.woff2" className="hidden" onChange={onFont} />
          </Card>

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
        </div>
      )}

      {mode === "files" && (
        <div className="space-y-2.5">
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
                <Save size={13} aria-hidden /> Save
              </button>
              <button type="button" className="btn flex-1" onClick={() => st.saveAsNew()}>
                Copy
              </button>
            </div>
            <button type="button" className="btn w-full" onClick={() => importRef.current?.click()}>
              <Upload size={13} aria-hidden /> Import image
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
            <p className="text-[9px] leading-relaxed" style={{ color: "var(--text-mute)" }}>
              PNG, JPG or SVG. Files stay in this browser.
            </p>
          </Card>

          <Card title="Library" hint={`${st.designs.length}`}>
            {!st.designs.length ? (
              <p className="py-5 text-center text-[10px]" style={{ color: "var(--text-mute)" }}>
                No saved files yet. Save the current stamp to start a library.
              </p>
            ) : (
              <div className="space-y-1.5">
                {st.designs.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-2 border p-1.5"
                    style={{
                      borderColor: d.id === st.currentDesignId ? "var(--border)" : "var(--border-soft)",
                      background: "var(--bg-sunken)",
                    }}
                  >
                    <div
                      className="checkerboard grid h-10 w-10 shrink-0 place-items-center overflow-hidden"
                      style={{ backgroundSize: "8px 8px" }}
                    >
                      {d.thumb ? (
                        <img src={d.thumb} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-[9px]" style={{ color: "var(--text-mute)" }}>
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
                          <p className="truncate text-[10px] font-semibold">{d.name}</p>
                          <p className="truncate text-[9px]" style={{ color: "var(--text-mute)" }}>
                            {new Date(d.updated).toLocaleString()}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Tooltip label="Open" side="top">
                        <button type="button" className="btn btn-icon" aria-label="Open file" onClick={() => st.loadDesign(d.id)}>
                          <FolderOpen size={12} />
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
                          <Pencil size={12} />
                        </button>
                      </Tooltip>
                      <Tooltip label="Delete" side="top">
                        <button type="button" className="btn btn-icon btn-danger" aria-label="Delete" onClick={() => st.removeDesign(d.id)}>
                          <Trash2 size={12} />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {mode === "fix" && (
        <div className="space-y-2.5">
          <div
            className="grid grid-cols-2 border"
            style={{ borderColor: "var(--border-soft)", background: "var(--bg-sunken)" }}
            role="tablist"
            aria-label="Fix tools"
          >
            {[
              { id: "health", label: "Health", icon: LifeBuoy },
              { id: "keys", label: "Keys", icon: Keyboard },
            ].map((t) => {
              const on = fixView === t.id;
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setFixView(t.id)}
                  className="flex items-center justify-center gap-1.5 py-1.5 text-[9px] font-semibold"
                  style={{
                    background: on ? "var(--bg-raised)" : "transparent",
                    color: on ? "var(--text)" : "var(--text-mute)",
                  }}
                >
                  <Icon size={11} aria-hidden />
                  {t.label}
                </button>
              );
            })}
          </div>

          {fixView === "health" && (
            <>
              <Card title="Studio health">
                <div className="space-y-1">
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
                  <Type size={12} aria-hidden /> Reload fonts
                </button>
                <button
                  type="button"
                  className="btn w-full"
                  onClick={() => st.toast("Grid is in the canvas corner controls", "info")}
                >
                  <Grid3x3 size={12} aria-hidden /> Check grid controls
                </button>
                <button
                  type="button"
                  className="btn w-full"
                  onClick={() => st.setA11y({ reduceMotion: false, highContrast: false, largeControls: false, alwaysFocus: false })}
                >
                  <Contrast size={12} aria-hidden /> Reset comfort options
                </button>
              </Card>

              <Card title="Reset" hint="Designs are kept">
                <button type="button" className="btn w-full" onClick={() => st.discardAutosave()} disabled={!status.autosave}>
                  Clear draft session
                </button>
                <button type="button" className="btn w-full" onClick={() => window.location.reload()}>
                  <RotateCcw size={12} aria-hidden /> Reload app
                </button>
                <button type="button" className="btn btn-danger w-full" onClick={() => st.resetStudioPrefs()}>
                  <Trash2 size={12} aria-hidden /> Reset studio settings
                </button>
                <p className="text-[9px] leading-relaxed" style={{ color: "var(--text-mute)" }}>
                  Resetting settings keeps saved stamps. Ink, paper and desk colours stay on the bottom bar.
                </p>
              </Card>
            </>
          )}

          {fixView === "keys" && (
            <div className="card overflow-hidden">
              {SHORTCUTS.map((s, i) => (
                <div
                  key={s.key}
                  className="flex items-center justify-between gap-2 px-2.5 py-1.5"
                  style={{ borderTop: i ? "1px solid var(--border-soft)" : "none" }}
                >
                  <span className="text-[10px]" style={{ color: "var(--text-dim)" }}>
                    {s.desc}
                  </span>
                  <kbd
                    className="border px-1.5 py-0.5 font-mono text-[9px] font-semibold"
                    style={{ borderColor: "var(--border-soft)", background: "var(--bg-sunken)", color: "var(--text-dim)" }}
                  >
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
