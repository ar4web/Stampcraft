import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width:${breakpoint - 1}px)`);
    const onChange = (e) => setMobile(e.matches);
    setMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [breakpoint]);
  return mobile;
}

export default function DraggablePanel({
  title,
  icon: Icon,
  width = 300,
  side = "left",
  open,
  onClose,
  children,
}) {
  const mobile = useIsMobile();
  const hoverTimer = useRef(null);
  const [dockWidth, setDockWidth] = useState(width);
  const drag = useRef(null);

  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  useEffect(() => {
    if (!mobile || !open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobile, open, onClose]);

  const startResize = (e) => {
    e.preventDefault();
    drag.current = { startX: e.clientX, startW: dockWidth };
    const onMove = (ev) => {
      if (!drag.current) return;
      const dx = ev.clientX - drag.current.startX;
      const next = side === "right" ? drag.current.startW - dx : drag.current.startW + dx;
      setDockWidth(Math.min(440, Math.max(260, next)));
    };
    const onUp = () => {
      drag.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const collapseBtn = (
    <button
      type="button"
      onClick={onClose}
      className="btn btn-ghost btn-icon"
      title="Collapse panel"
      aria-label={`Collapse ${title} panel`}
    >
      {mobile ? (
        <X size={15} />
      ) : side === "right" ? (
        <ChevronRight size={15} />
      ) : (
        <ChevronLeft size={15} />
      )}
    </button>
  );

  const header = (
    <div
      className="flex h-10 shrink-0 items-center gap-2 border-b px-2.5"
      style={{ borderColor: "var(--border)", background: "var(--bg-raised)" }}
    >
      {side === "right" && !mobile && collapseBtn}
      {Icon && <Icon size={14} style={{ color: "var(--accent)" }} aria-hidden />}
      <h2 className="flex-1 truncate text-[10px] font-semibold uppercase tracking-[0.08em]">
        {title}
      </h2>
      {(side !== "right" || mobile) && collapseBtn}
    </div>
  );

  const body = <div className="scroll-thin flex-1 overflow-y-auto p-3.5">{children}</div>;

  if (mobile) {
    return (
      <>
        {open && (
          <div className="fixed inset-0 z-[49] bg-black/50" onClick={onClose} aria-hidden />
        )}
        <aside
          aria-label={title}
          aria-hidden={!open}
          className="fixed inset-x-0 bottom-0 z-[50] flex h-[70vh] flex-col border-t shadow-2xl"
          style={{
            background: "var(--bg-panel)",
            borderColor: "var(--border)",
            transform: open ? "translateY(0)" : "translateY(103%)",
            transition: "transform 0.2s ease",
            pointerEvents: open ? "auto" : "none",
            visibility: open ? "visible" : "hidden",
          }}
        >
          {header}
          {body}
        </aside>
      </>
    );
  }

  if (!open) {
    const Arrow = side === "right" ? ChevronLeft : ChevronRight;
    return (
      <button
        type="button"
        onClick={onClose}
        onMouseEnter={() => {
          clearTimeout(hoverTimer.current);
          hoverTimer.current = setTimeout(onClose, 450);
        }}
        onMouseLeave={() => clearTimeout(hoverTimer.current)}
        aria-label={`Open ${title} panel`}
        title={`Open ${title}`}
        className="flex h-full w-8 shrink-0 flex-col items-center justify-center gap-2 border"
        style={{ background: "var(--bg-panel)", borderColor: "var(--border)" }}
      >
        <Arrow size={15} style={{ color: "var(--text-dim)" }} />
      </button>
    );
  }

  return (
    <div className="relative h-full shrink-0" style={{ width: dockWidth }}>
      <aside
        aria-label={title}
        className="flex h-full flex-col overflow-hidden border"
        style={{ background: "var(--bg-panel)", borderColor: "var(--border)" }}
      >
        {header}
        {body}
      </aside>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={`Resize ${title}`}
        onMouseDown={startResize}
        className="absolute top-0 z-10 h-full w-2 cursor-ew-resize"
        style={{
          [side === "right" ? "left" : "right"]: 0,
          background: "transparent",
        }}
      />
    </div>
  );
}
