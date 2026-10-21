import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpToLine,
  Copy,
  Crosshair,
  FlipHorizontal,
  FlipVertical,
  Lock,
  RotateCw,
  Spline,
  Trash2,
  Unlock,
} from "lucide-react";
import useStampStore from "../store/useStampStore";
import { selectionKind, toggleTextCurve } from "../utils/canvas";
import {
  alignSelection,
  bringToFront,
  deleteSelection,
  duplicateSelection,
  sendToBack,
} from "../utils/actions";
import Tooltip from "./Tooltip";

/**
 * Floating quick-actions toolbar that tracks the selected object on screen.
 * Appears right above the active node and stays aligned while dragging / zooming.
 */
export default function ContextToolbar({ scrollRef }) {
  const canvas = useStampStore((s) => s.canvas);
  const selected = useStampStore((s) => s.selected);
  const selVersion = useStampStore((s) => s.selVersion);
  const zoom = useStampStore((s) => s.zoom);
  const commit = useStampStore((s) => s.commit);
  const touchLayers = useStampStore((s) => s.touchLayers);
  const showRulers = useStampStore((s) => s.showRulers);
  const [pos, setPos] = useState(null);
  const [, force] = useState(0);

  useEffect(() => {
    if (!canvas || !selected) {
      setPos(null);
      return;
    }
    const measure = () => {
      if (!canvas.getActiveObject()) return setPos(null);
      const el = canvas.getElement();
      const host = scrollRef?.current;
      if (!el || !host) return;
      const cRect = el.getBoundingClientRect();
      const hRect = host.getBoundingClientRect();
      const barH = 36;
      const gap = 8;
      const ruler = showRulers ? 18 : 0;
      setPos({
        left: cRect.left - hRect.left + cRect.width / 2,
        top: cRect.top - hRect.top - barH - gap - ruler,
      });
    };
    measure();
    const host = scrollRef?.current;
    host?.addEventListener("scroll", measure);
    window.addEventListener("resize", measure);
    return () => {
      host?.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [canvas, selected, selVersion, zoom, scrollRef, showRulers]);

  if (!selected || !pos) return null;

  const kind = selectionKind(selected);
  const isText = kind === "text" || kind === "arc";

  const mutate = (patch) => {
    selected.set(patch);
    selected.setCoords();
    canvas.requestRenderAll();
    commit();
  };

  const curve = () => {
    toggleTextCurve(canvas, selected);
    commit();
    useStampStore.getState().syncSelection();
  };

  const locked = !!selected.lockedLayer;
  const toggleLock = () => {
    selected.lockedLayer = !locked;
    selected.selectable = locked;
    selected.evented = locked;
    if (!locked) canvas.discardActiveObject();
    canvas.requestRenderAll();
    commit();
    touchLayers();
    force((n) => n + 1);
  };

  const Btn = ({ title, shortcut, onClick, children, danger }) => (
    <Tooltip label={title} shortcut={shortcut} side="top" delay={120}>
      <button
        type="button"
        aria-label={title}
        onClick={onClick}
        className={`grid h-8 w-8 place-items-center transition-colors ${
          danger ? "danger-hover" : "hover:bg-[var(--bg-raised)]"
        }`}
        style={{ color: "var(--text)" }}
      >
        {children}
      </button>
    </Tooltip>
  );

  return (
    <div
      className="pointer-events-auto absolute z-[46] flex -translate-x-1/2 items-center gap-0.5 px-1.5 py-1 rounded border shadow-xl backdrop-blur"
      style={{
        left: pos.left,
        top: pos.top,
        background: "var(--bg-panel)",
        borderColor: "var(--border)",
      }}
    >
      <Btn title="Duplicate" shortcut="Ctrl+D" onClick={duplicateSelection}>
        <Copy size={15} />
      </Btn>
      <Btn title="Centre on Stamp" onClick={() => alignSelection("both")}>
        <Crosshair size={15} />
      </Btn>
      <Btn title="Bring to Front" shortcut="Ctrl+]" onClick={bringToFront}>
        <ArrowUpToLine size={15} />
      </Btn>
      <Btn title="Send to Back" shortcut="Ctrl+[" onClick={sendToBack}>
        <ArrowDownToLine size={15} />
      </Btn>
      <div className="mx-0.5 h-4 w-px bg-[var(--border)]" />
      <Btn title="Flip Horizontal" onClick={() => mutate({ flipX: !selected.flipX })}>
        <FlipHorizontal size={15} />
      </Btn>
      <Btn title="Flip Vertical" onClick={() => mutate({ flipY: !selected.flipY })}>
        <FlipVertical size={15} />
      </Btn>
      <Btn title="Rotate 90°" onClick={() => mutate({ angle: ((selected.angle || 0) + 90) % 360 })}>
        <RotateCw size={15} />
      </Btn>
      {isText && (
        <Btn title={kind === "arc" ? "Make Straight" : "Make Curved"} onClick={curve}>
          <Spline size={15} className={kind === "arc" ? "text-[var(--accent)]" : ""} />
        </Btn>
      )}
      <div className="mx-0.5 h-4 w-px bg-[var(--border)]" />
      <Btn title={locked ? "Unlock Layer" : "Lock Layer"} onClick={toggleLock}>
        {locked ? <Lock size={15} className="text-[var(--accent)]" /> : <Unlock size={15} />}
      </Btn>
      <div className="mx-0.5 h-4 w-px bg-[var(--border)]" />
      <Btn title="Delete Layer" shortcut="Del" danger onClick={deleteSelection}>
        <Trash2 size={15} className="text-[#ef4444]" />
      </Btn>
    </div>
  );
}
