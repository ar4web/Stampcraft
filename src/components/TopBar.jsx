import { useEffect, useRef, useState } from "react";
import {
  Download,
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
import ExportPanel from "./RightPanel/ExportPanel";
import Tooltip from "./Tooltip";

function IconBtn({ label, hint, onClick, disabled, children, danger, ok }) {
  return (
    <Tooltip label={label} hint={hint} side="bottom" delay={120}>
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        disabled={disabled}
        className={`btn btn-icon ${danger ? "btn-danger" : ""} ${ok ? "btn-ok" : ""}`}
      >
        {children}
      </button>
    </Tooltip>
  );
}

function DownloadBtn() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Tooltip label="Download" hint="Save & export" shortcut="Ctrl+E" side="bottom" delay={120}>
        <button
          type="button"
          aria-label="Download"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="btn btn-icon"
        >
          <Download size={14} />
        </button>
      </Tooltip>
      {open && (
        <div
          role="dialog"
          aria-label="Export"
          className="absolute left-1/2 top-[calc(100%+8px)] z-[80] w-[280px] -translate-x-1/2 p-2 shadow-2xl"
          style={{ background: "var(--bg-panel)" }}
        >
          <ExportPanel />
        </div>
      )}
    </div>
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
  } = useStampStore();

  return (
    <header
      className="sticky top-0 z-40 grid w-full shrink-0 grid-cols-[1fr_auto_1fr] items-center px-3 sm:px-4"
      style={{
        height: "var(--bar-h)",
        background: "var(--bg-panel)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <div className="grid h-7 w-7 shrink-0 place-items-center" style={{ background: "var(--accent)" }}>
          <Stamp size={14} color="#fff" />
        </div>
        <span className="hidden text-[13px] font-semibold tracking-tight sm:block">Stampcraft</span>
        <span className="hidden min-w-0 max-w-[160px] items-center gap-1.5 md:flex">
          <span className="truncate text-[11px] font-medium" style={{ color: "var(--text-dim)" }}>
            {designName}
          </span>
          {dirty && (
            <span className="shrink-0 text-[10px]" style={{ color: "var(--accent)" }} title="Unsaved changes">
              Unsaved
            </span>
          )}
        </span>
      </div>

      <div className="flex items-center gap-1" role="toolbar" aria-label="Document actions">
        <IconBtn label="Undo" hint="Ctrl+Z" onClick={undo} disabled={!canUndo}>
          <Undo2 size={14} />
        </IconBtn>
        <IconBtn label="Redo" hint="Ctrl+Shift+Z" onClick={redo} disabled={!canRedo}>
          <Redo2 size={14} />
        </IconBtn>
        <IconBtn label="Save Work" hint="Ctrl+S" ok onClick={() => saveCurrent()}>
          <Save size={14} />
        </IconBtn>
        <DownloadBtn />
      </div>

      <div className="flex items-center justify-end gap-1">
        <IconBtn label="Delete" hint="Ctrl+N" danger onClick={() => clearCanvas()}>
          <Trash2 size={14} />
        </IconBtn>
        <IconBtn label={theme === "dark" ? "Light mode" : "Dark mode"} onClick={toggleTheme}>
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
        </IconBtn>
        <IconBtn label="Settings" hint="Ctrl+K" onClick={toggleSettings}>
          <Settings2 size={14} />
        </IconBtn>
      </div>
    </header>
  );
}
