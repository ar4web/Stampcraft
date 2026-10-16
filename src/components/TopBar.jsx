import {
  Copy,
  Download,
  FileImage,
  FolderOpen,
  LayoutGrid,
  Moon,
  PanelLeft,
  PanelRight,
  Redo2,
  Save,
  Stamp,
  Sun,
  Trash2,
  Undo2,
} from "lucide-react";
import useStampStore from "../store/useStampStore";
import {
  clearCanvas,
  doExportPNG,
  doExportSVG,
  duplicateSelection,
} from "../utils/actions";

function IconBtn({ title, onClick, disabled, children, active }) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className="btn !px-2 !py-1.5"
      style={active ? { borderColor: "var(--accent)", color: "var(--accent)" } : undefined}
    >
      {children}
    </button>
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
    openModal,
    designName,
    setDesignName,
    dirty,
    saveCurrent,
    toggleLeft,
    toggleRight,
    leftOpen,
    rightOpen,
  } = useStampStore();

  return (
    <header
      className="sticky top-0 z-40 flex h-14 w-full shrink-0 items-center gap-2 border-b px-2 sm:px-3"
      style={{ background: "var(--bg-panel)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-2 pr-1">
        <div
          className="grid h-8 w-8 place-items-center rounded-lg"
          style={{ background: "var(--accent)" }}
        >
          <Stamp size={17} color="#fff" />
        </div>
        <span className="hidden text-sm font-bold tracking-tight sm:block">
          Stampcraft
        </span>
      </div>

      <div className="hidden items-center gap-1 md:flex">
        <IconBtn title="Toggle tools panel" onClick={toggleLeft} active={leftOpen}>
          <PanelLeft size={15} />
        </IconBtn>
        <IconBtn title="Toggle properties panel" onClick={toggleRight} active={rightOpen}>
          <PanelRight size={15} />
        </IconBtn>
      </div>

      <div className="mx-1 h-6 w-px" style={{ background: "var(--border)" }} />

      <IconBtn title="Undo (Ctrl+Z)" onClick={undo} disabled={!canUndo}>
        <Undo2 size={15} />
      </IconBtn>
      <IconBtn title="Redo (Ctrl+Shift+Z)" onClick={redo} disabled={!canRedo}>
        <Redo2 size={15} />
      </IconBtn>
      <IconBtn title="Duplicate (Ctrl+D)" onClick={duplicateSelection}>
        <Copy size={15} />
      </IconBtn>
      <IconBtn title="Clear canvas (Ctrl+N)" onClick={() => clearCanvas()}>
        <Trash2 size={15} />
      </IconBtn>

      <div className="mx-1 hidden h-6 w-px sm:block" style={{ background: "var(--border)" }} />

      <input
        value={designName}
        onChange={(e) => setDesignName(e.target.value)}
        className="field hidden !w-44 sm:block"
        aria-label="Design name"
      />
      {dirty && (
        <span className="hidden text-[10px] sm:block" style={{ color: "var(--text-dim)" }}>
          ● unsaved
        </span>
      )}

      <div className="flex-1" />

      <IconBtn title="Templates" onClick={() => openModal("template")}>
        <LayoutGrid size={15} />
        <span className="hidden text-[11px] lg:inline">Templates</span>
      </IconBtn>
      <IconBtn title="My designs" onClick={() => openModal("saveload")}>
        <FolderOpen size={15} />
      </IconBtn>
      <IconBtn title="Save (Ctrl+S)" onClick={() => saveCurrent()}>
        <Save size={15} />
      </IconBtn>
      <IconBtn title="Export SVG" onClick={doExportSVG}>
        <FileImage size={15} />
      </IconBtn>
      <button
        className="btn btn-accent"
        title="Export PNG (Ctrl+E)"
        onClick={() => openModal("export")}
      >
        <Download size={15} />
        <span className="hidden sm:inline">Export</span>
      </button>

      <div className="mx-1 h-6 w-px" style={{ background: "var(--border)" }} />
      <IconBtn title="Toggle theme" onClick={toggleTheme}>
        {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
      </IconBtn>
      <button
        className="btn !px-2 !py-1.5 md:hidden"
        title="Quick export 3x"
        onClick={() => doExportPNG(3)}
      >
        <Download size={15} />
      </button>
    </header>
  );
}
