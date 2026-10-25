import { useEffect, useRef, useState } from "react";
import useStampStore from "../../store/useStampStore";
import useCanvas from "../../hooks/useCanvas";
import { CANVAS_SIZE, addImageFromFile, applyStampFilter, clipObjectToRing } from "../../utils/canvas";
import { isStampFile } from "../../utils/stampfile";
import {
  alignSelection,
  bringToFront,
  clearCanvas,
  deleteSelection,
  doExportPNG,
  duplicateSelection,
  selectAll,
  sendToBack,
} from "../../utils/actions";
import { selectionKind, toggleTextCurve } from "../../utils/canvas";
import ZoomControls from "./ZoomControls";
import Rulers from "./Rulers";
import ContextToolbar from "../ContextToolbar";

export default function CanvasArea() {
  const elRef = useRef(null);
  const scrollRef = useRef(null);
  const [dropping, setDropping] = useState(false);
  const [panning, setPanning] = useState(false);
  const store = useStampStore();
  const zoom = store.zoom;
  const showRulers = store.showRulers;
  const showGrid = store.showGrid;
  const gridSize = store.gridSize;
  const gridOpacity = store.gridOpacity;
  const workspaceColor = store.workspaceColor;
  const canvasColor = store.canvasColor;
  const showGuides = store.showGuides;
  const [menu, setMenu] = useState(null);

  useCanvas(elRef);

  /* wheel zoom + spacebar pan */
  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    const onWheel = (e) => {
      if (e.shiftKey) return;
      e.preventDefault();
      const store = useStampStore.getState();
      store.setZoom(store.zoom + (e.deltaY > 0 ? -0.1 : 0.1));
    };
    node.addEventListener("wheel", onWheel, { passive: false });

    let space = false;
    let drag = null;
    const down = (e) => {
      if (e.code === "Space" && !space) {
        const t = e.target;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
        space = true;
        setPanning(true);
        e.preventDefault();
      }
    };
    const up = (e) => {
      if (e.code === "Space") {
        space = false;
        setPanning(false);
      }
    };
    const mdown = (e) => {
      if (!space) return;
      drag = { x: e.clientX, y: e.clientY, l: node.scrollLeft, t: node.scrollTop };
      e.preventDefault();
      e.stopPropagation();
    };
    const mmove = (e) => {
      if (!drag) return;
      node.scrollLeft = drag.l - (e.clientX - drag.x);
      node.scrollTop = drag.t - (e.clientY - drag.y);
    };
    const mup = () => (drag = null);

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    node.addEventListener("mousedown", mdown, true);
    window.addEventListener("mousemove", mmove);
    window.addEventListener("mouseup", mup);
    return () => {
      node.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      node.removeEventListener("mousedown", mdown, true);
      window.removeEventListener("mousemove", mmove);
      window.removeEventListener("mouseup", mup);
    };
  }, []);

  const onDrop = async (e) => {
    e.preventDefault();
    setDropping(false);
    const store = useStampStore.getState();
    const file = e.dataTransfer.files?.[0];
    if (!file || !store.canvas) return;
    try {
      if (isStampFile(file)) {
        await store.importStampFile(file);
        return;
      }
      const obj = await addImageFromFile(store.canvas, file);
      if (obj.type === "image") await applyStampFilter(store.canvas, obj, true);
      try {
        await clipObjectToRing(store.canvas, obj);
      } catch {
        /* no frame yet */
      }
      store.commit();
      store.syncSelection();
      store.toast(`Imported ${file.name}`, "success");
    } catch (err) {
      store.toast(`Import failed: ${err.message}`, "error");
    }
  };

  const onContextMenu = (e) => {
    e.preventDefault();
    // Right-click selects the object under the cursor, like desktop editors.
    const canvas = store.canvas;
    if (canvas) {
      try {
        const target = canvas.findTarget(e.nativeEvent || e);
        if (target && target.selectable !== false) {
          canvas.setActiveObject(target);
          canvas.requestRenderAll();
          store.syncSelection();
        }
      } catch { /* findTarget can throw on edge coords — menu still opens */ }
    }
    setMenu({ x: e.clientX, y: e.clientY });
  };

  const closeMenu = () => setMenu(null);

  // Menu adapts: object tools when something is under the cursor,
  // canvas tools otherwise. "—" entries render as separators.
  const sel = store.selected;
  const selKind = selectionKind(sel);
  const isTextSel = selKind === "text" || selKind === "arc";

  const mutateSel = (patch) => {
    if (!sel || !store.canvas) return;
    sel.set(patch);
    sel.setCoords();
    store.canvas.requestRenderAll();
    store.commit();
  };

  const menuItems = sel
    ? [
        { label: "Duplicate", shortcut: "Ctrl+D", action: duplicateSelection },
        ...(isTextSel
          ? [{
              label: selKind === "arc" ? "Make straight" : "Make curved",
              shortcut: "",
              action: () => {
                toggleTextCurve(store.canvas, sel);
                store.commit();
                store.syncSelection();
              },
            }]
          : []),
        { label: "Flip horizontal", shortcut: "", action: () => mutateSel({ flipX: !sel.flipX }) },
        { label: "Flip vertical", shortcut: "", action: () => mutateSel({ flipY: !sel.flipY }) },
        { label: "Rotate 90°", shortcut: "", action: () => mutateSel({ angle: ((sel.angle || 0) + 90) % 360 }) },
        { sep: true },
        { label: "Centre on stamp", shortcut: "", action: () => alignSelection("both") },
        { label: "Bring to front", shortcut: "Ctrl+]", action: bringToFront },
        { label: "Send to back", shortcut: "Ctrl+[", action: sendToBack },
        { sep: true },
        { label: "Delete", shortcut: "Del", danger: true, action: deleteSelection },
      ]
    : [
        { label: "Undo", shortcut: "Ctrl+Z", action: () => store.undo() },
        { label: "Redo", shortcut: "Ctrl+Shift+Z", action: () => store.redo() },
        { label: "Select all", shortcut: "Ctrl+A", action: selectAll },
        { sep: true },
        { label: "Export PNG", shortcut: "Ctrl+E", action: () => doExportPNG(3) },
        { label: "Preferences", shortcut: "Ctrl+K", action: () => store.toggleSettings() },
        { sep: true },
        { label: "Clear canvas", shortcut: "Ctrl+N", danger: true, action: clearCanvas },
      ];

  return (
    // Outer shell never scrolls, so overlays (zoom HUD, context toolbar)
    // stay pinned to the viewport instead of drifting with the artboard.
    <main
      id="canvas-workspace"
      tabIndex={-1}
      className="relative min-w-0 flex-1 overflow-hidden border"
      style={{ borderColor: "var(--border)" }}
    >
      <div
        ref={scrollRef}
        onContextMenu={onContextMenu}
        onDragOver={(e) => {
          e.preventDefault();
          setDropping(true);
        }}
        onDragLeave={() => setDropping(false)}
        onDrop={onDrop}
        onMouseDown={(e) => {
          if (e.target.tagName === "CANVAS") return;
          const canvas = useStampStore.getState().canvas;
          if (!canvas?.getActiveObject()) return;
          canvas.discardActiveObject();
          canvas.requestRenderAll();
          useStampStore.getState().syncSelection();
        }}
        className={`scroll-thin absolute inset-0 overflow-auto ${
          workspaceColor === "checkerboard" ? "workspace-checkerboard" : ""
        }`}
        style={{
          cursor: panning ? "grab" : "default",
          background:
            workspaceColor && workspaceColor !== "checkerboard"
              ? workspaceColor
              : workspaceColor === "checkerboard"
              ? undefined
              : "var(--bg-primary)",
        }}
      >
        <div className="flex min-h-full min-w-full items-center justify-center p-5 sm:p-8">
          <div className="relative">
            {showRulers && <Rulers zoom={zoom} />}
            <div
              className={`relative shadow-2xl ${
                !canvasColor ? "canvas-checkerboard" : ""
              }`}
              style={{
                outline: "1px solid var(--border)",
                backgroundColor: canvasColor || undefined,
              }}
            >
              <canvas ref={elRef} width={CANVAS_SIZE} height={CANVAS_SIZE} aria-label="Stamp canvas" />
              {showGrid && (
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    backgroundImage: `linear-gradient(to right, rgba(148,155,173,${gridOpacity}) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,155,173,${gridOpacity}) 1px, transparent 1px)`,
                    backgroundSize: `${gridSize * zoom}px ${gridSize * zoom}px`,
                  }}
                />
              )}
              {showGuides && (
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2" style={{ background: "var(--accent)", opacity: 0.45 }} />
                  <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2" style={{ background: "var(--accent)", opacity: 0.45 }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ContextToolbar scrollRef={scrollRef} />

      {dropping && (
        <div
          className="pointer-events-none absolute inset-0 z-30 grid place-items-center border-2 border-dashed"
          style={{
            borderColor: "var(--accent)",
            background: "var(--bg-raised)",
          }}
        >
          <p
            className="border px-4 py-2 text-sm font-semibold shadow-lg"
            style={{
              background: "var(--bg-panel)",
              borderColor: "var(--border)",
              color: "var(--accent)",
            }}
          >
            Drop image or SVG to place on the stamp
          </p>
        </div>
      )}

      <ZoomControls />

      {menu && (
        <>
          <div
            className="fixed inset-0 z-[58]"
            onClick={closeMenu}
            onContextMenu={(e) => {
              e.preventDefault();
              closeMenu();
            }}
          />
          <div
            className="fixed z-[60] border py-0.5 shadow-2xl"
            style={{
              background: "var(--bg-panel)",
              borderColor: "var(--border)",
              left: Math.min(window.innerWidth - 190, menu.x),
              top: Math.min(window.innerHeight - 330, menu.y),
              minWidth: 160,
            }}
          >
            {menuItems.map((item, i) =>
              item.sep ? (
                <div key={i} className="h-px" style={{ background: "var(--border)" }} />
              ) : (
                <button
                  key={i}
                  type="button"
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[12px] transition-colors ${
                    item.danger ? "danger-hover" : "hover:bg-[var(--bg-raised)]"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    item.action();
                    closeMenu();
                  }}
                  style={{ color: item.danger ? "#f87171" : "var(--text)" }}
                >
                  <span>{item.label}</span>
                  <span className="text-[11px] font-mono" style={{ color: "var(--text-dim)" }}>
                    {item.shortcut}
                  </span>
                </button>
              )
            )}
          </div>
        </>
      )}
    </main>
  );
}
