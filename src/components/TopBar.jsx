import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  Download,
  FileImage,
  FolderOpen,
  Moon,
  Redo2,
  Save,
  Settings2,
  Sparkles,
  Stamp,
  Sun,
  Trash2,
  Undo2,
} from "lucide-react";
import useStampStore from "../store/useStampStore";
import { clearCanvas, doExportJPG, doExportPNG, doExportSVG } from "../utils/actions";
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

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleOutsideClick = (e) => {
      if (!dropdownRef.current?.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleEsc);
    };
  }, [dropdownOpen]);

  return (
    <header
      className="sticky top-0 z-40 flex w-full shrink-0 items-center justify-between px-2 sm:px-4"
      style={{
        height: "var(--bar-h)",
        background: "var(--bg-panel)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Brand & Project Info */}
      <div className="flex min-w-0 items-center gap-2">
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

        <div className="hidden min-w-0 max-w-[170px] items-center gap-1.5 md:flex">
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

      {/* Primary Center Action Group: Undo, Redo, Save, My Stamps, Download */}
      <div className="flex items-center gap-1 sm:gap-1.5" role="toolbar" aria-label="Document actions">
        <div className="flex items-center gap-0.5 border-r pr-1 sm:pr-2" style={{ borderColor: "var(--border)" }}>
          <ToolBtn label="Undo" hint="Ctrl+Z" onClick={undo} disabled={!canUndo}>
            <Undo2 size={14} />
          </ToolBtn>
          <ToolBtn label="Redo" hint="Ctrl+Shift+Z" onClick={redo} disabled={!canRedo}>
            <Redo2 size={14} />
          </ToolBtn>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <ToolBtn label="Save Design" hint="Ctrl+S" ok onClick={() => saveCurrent()}>
            <Save size={14} />
            <span className="hidden sm:inline">Save</span>
          </ToolBtn>

          <ToolBtn label="Saved Designs" hint="Open design library" onClick={() => openModal("saveload")}>
            <FolderOpen size={14} />
            <span className="hidden sm:inline">My Stamps</span>
          </ToolBtn>

          {/* Quick Select Split Download Button */}
          <div ref={dropdownRef} className="relative flex items-stretch">
            {/* Direct 1-click download button */}
            <button
              type="button"
              onClick={() => doExportPNG(3, { transparentOnly: true })}
              className="btn btn-accent flex items-center gap-1.5 h-8 px-2.5 sm:px-3 text-[11px] font-bold shadow-md hover:brightness-110 active:scale-95"
              title="1-Click Quick Download PNG (Transparent, High Res 3x)"
            >
              <Download size={14} />
              <span>Download</span>
            </button>

            {/* Dropdown caret trigger for instant mouse selection of formats */}
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              aria-label="Select download format"
              aria-expanded={dropdownOpen}
              className="btn btn-accent h-8 !px-1.5 border-l border-white/20 hover:brightness-125"
              title="Choose download format (PNG, SVG, JPG, or Options)"
            >
              <ChevronDown size={13} className={`transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Instant mouse click dropdown menu */}
            {dropdownOpen && (
              <div
                role="menu"
                className="toast-in absolute right-0 top-[calc(100%+6px)] z-[85] w-56 p-1.5 rounded border shadow-2xl backdrop-blur-md"
                style={{
                  background: "var(--bg-panel)",
                  borderColor: "var(--border)",
                }}
              >
                <div className="px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[var(--text-mute)] border-b pb-1 mb-1" style={{ borderColor: "var(--border-soft)" }}>
                  Instant Quick Download
                </div>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    doExportPNG(3, { transparentOnly: true });
                    setDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-2.5 py-1.5 text-left rounded hover:bg-[var(--bg-raised)] transition-colors group"
                >
                  <div className="grid h-6 w-6 shrink-0 place-items-center rounded bg-amber-500/10 text-amber-500">
                    <FileImage size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-[var(--text)] flex items-center justify-between">
                      <span>PNG Transparent</span>
                      <span className="text-[9px] font-mono text-[var(--accent)] font-semibold">1800px</span>
                    </div>
                    <div className="text-[9px] text-[var(--text-dim)] truncate">Crisp transparent stamp for docs</div>
                  </div>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    doExportSVG({ transparentOnly: true });
                    setDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-2.5 py-1.5 text-left rounded hover:bg-[var(--bg-raised)] transition-colors group"
                >
                  <div className="grid h-6 w-6 shrink-0 place-items-center rounded bg-blue-500/10 text-blue-500">
                    <Sparkles size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-[var(--text)] flex items-center justify-between">
                      <span>SVG Vector</span>
                      <span className="text-[9px] font-mono text-[var(--text-dim)]">Vector</span>
                    </div>
                    <div className="text-[9px] text-[var(--text-dim)] truncate">Infinitely scalable for print/CNC</div>
                  </div>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    doExportJPG(3, { trim: false });
                    setDropdownOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 px-2.5 py-1.5 text-left rounded hover:bg-[var(--bg-raised)] transition-colors group"
                >
                  <div className="grid h-6 w-6 shrink-0 place-items-center rounded bg-emerald-500/10 text-emerald-500">
                    <Download size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-[var(--text)] flex items-center justify-between">
                      <span>JPG Photo</span>
                      <span className="text-[9px] font-mono text-[var(--accent)] font-semibold">1800px</span>
                    </div>
                    <div className="text-[9px] text-[var(--text-dim)] truncate">White canvas background</div>
                  </div>
                </button>

                <div className="border-t my-1 pt-1" style={{ borderColor: "var(--border-soft)" }}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setDropdownOpen(false);
                      openModal("download");
                    }}
                    className="flex w-full items-center justify-center gap-1.5 px-2.5 py-1.5 text-center rounded text-[10px] font-bold text-[var(--accent)] hover:bg-[var(--accent-dim)] transition-colors"
                  >
                    <span>More Options & Custom Sizes...</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Controls: Clear Canvas, Theme Toggle, Settings */}
      <div className="flex items-center gap-0.5 sm:gap-1">
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
