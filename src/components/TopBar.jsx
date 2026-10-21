import {
  Download,
  FolderOpen,
  Moon,
  Redo2,
  Save,
  Settings2,
  Stamp,
  Sun,
  Trash2,
  Undo2,
} from "lucide-react";
import useStampStore from "../store/useStampStore";
import { clearCanvas } from "../utils/actions";
import Tooltip from "./Tooltip";

function ToolBtn({ label, hint, onClick, disabled, children, danger, ok, active, badge }) {
  return (
    <Tooltip label={label} hint={hint} side="bottom" delay={120}>
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        className={`btn flex items-center gap-1.5 h-8 px-2.5 text-[11px] font-medium transition-all ${
          danger ? "btn-danger" : ""
        } ${ok ? "btn-ok" : ""} ${active ? "btn-on" : ""}`}
      >
        {children}
        {badge && (
          <span
            className="ml-0.5 px-1 py-0.2 rounded text-[9px] font-bold"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {badge}
          </span>
        )}
      </button>
    </Tooltip>
  );
}

export default function TopBar() {
  const {
    theme,
    toggleTheme,
    undo,
    redo,
    canUndo,
    canRedo,
    designName,
    dirty,
    saveCurrent,
    toggleSettings,
    openModal,
  } = useStampStore();

  return (
    <header
      className="sticky top-0 z-40 flex w-full shrink-0 items-center justify-between px-3 sm:px-4"
      style={{
        height: "var(--bar-h)",
        background: "var(--bg-panel)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Brand & Project Info */}
      <div className="flex min-w-0 items-center gap-2.5">
        <div
          className="grid h-7 w-7 shrink-0 place-items-center rounded-sm shadow-sm"
          style={{ background: "var(--accent)" }}
        >
          <Stamp size={15} color="#fff" />
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-bold tracking-tight text-[var(--text)] leading-none">
            Stampcraft
          </span>
          <span className="text-[9px] font-medium text-[var(--text-mute)] leading-tight hidden sm:inline">
            Rubber Stamp Studio
          </span>
        </div>

        <div className="h-4 w-px mx-1 hidden md:block" style={{ background: "var(--border)" }} />

        <div className="hidden min-w-0 max-w-[180px] items-center gap-1.5 md:flex">
          <span
            className="truncate text-[11px] font-medium px-2 py-0.5 rounded border"
            style={{
              color: "var(--text)",
              borderColor: "var(--border-soft)",
              background: "var(--bg-sunken)",
            }}
            title={designName}
          >
            {designName}
          </span>
          {dirty && (
            <span
              className="shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded"
              style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
              title="Unsaved changes"
            >
              Unsaved
            </span>
          )}
        </div>
      </div>

      {/* Primary Center Action Group: Undo, Redo, Save, My Designs, Download */}
      <div className="flex items-center gap-1.5" role="toolbar" aria-label="Document actions">
        <div className="flex items-center gap-1 border-r pr-2" style={{ borderColor: "var(--border)" }}>
          <ToolBtn label="Undo" hint="Ctrl+Z" onClick={undo} disabled={!canUndo}>
            <Undo2 size={14} />
          </ToolBtn>
          <ToolBtn label="Redo" hint="Ctrl+Shift+Z" onClick={redo} disabled={!canRedo}>
            <Redo2 size={14} />
          </ToolBtn>
        </div>

        <div className="flex items-center gap-1.5">
          <ToolBtn label="Save Design" hint="Ctrl+S" ok onClick={() => saveCurrent()}>
            <Save size={14} />
            <span className="hidden sm:inline">Save</span>
          </ToolBtn>

          <ToolBtn label="Saved Designs" hint="Open design library" onClick={() => openModal("saveload")}>
            <FolderOpen size={14} />
            <span className="hidden sm:inline">My Stamps</span>
          </ToolBtn>

          {/* Prominent High-Contrast Clear Download Option Button */}
          <button
            type="button"
            onClick={() => openModal("download")}
            className="btn btn-accent flex items-center gap-1.5 h-8 px-3 text-[11px] font-bold shadow-md hover:brightness-110 active:scale-95"
            title="Download Stamp (PNG, SVG, JPG)"
          >
            <Download size={14} />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Right Controls: Clear Canvas, Theme Toggle, Settings */}
      <div className="flex items-center gap-1">
        <ToolBtn label="Clear Canvas" hint="Ctrl+N" danger onClick={() => clearCanvas()}>
          <Trash2 size={14} />
          <span className="hidden lg:inline text-[11px]">Clear</span>
        </ToolBtn>

        <div className="h-4 w-px mx-0.5" style={{ background: "var(--border)" }} />

        <ToolBtn
          label={theme === "dark" ? "Light theme" : "Dark theme"}
          onClick={toggleTheme}
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </ToolBtn>

        <ToolBtn label="Studio Preferences" hint="Ctrl+K" onClick={toggleSettings}>
          <Settings2 size={14} />
        </ToolBtn>
      </div>
    </header>
  );
}
