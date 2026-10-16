import { useEffect, useState } from "react";
import { Rnd } from "react-rnd";
import { GripVertical, X } from "lucide-react";

export function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return mobile;
}

/**
 * Sidebar shell: a drag-anywhere floating panel on desktop,
 * a full-screen bottom sheet on small screens.
 */
export default function DraggablePanel({
  title,
  icon: Icon,
  width = 260,
  side = "left",
  open,
  onClose,
  children,
}) {
  const mobile = useIsMobile();

  const header = (
    <div
      className="panel-drag flex h-9 shrink-0 cursor-grab items-center gap-1.5 border-b px-2 active:cursor-grabbing"
      style={{ borderColor: "var(--border)" }}
    >
      <GripVertical size={13} style={{ color: "var(--text-dim)" }} />
      {Icon && <Icon size={13} style={{ color: "var(--accent)" }} />}
      <span className="flex-1 text-[11px] font-bold uppercase tracking-wider">{title}</span>
      <button onClick={onClose} className="opacity-60 hover:opacity-100" title="Close panel">
        <X size={14} />
      </button>
    </div>
  );

  const body = (
    <div className="scroll-thin flex-1 overflow-y-auto p-2.5">{children}</div>
  );

  if (mobile) {
    return (
      <div
        className="fixed inset-x-0 bottom-0 z-50 flex h-[72vh] flex-col rounded-t-2xl border-t shadow-2xl"
        style={{
          background: "var(--bg-panel)",
          borderColor: "var(--border)",
          transform: open ? "translateY(0)" : "translateY(105%)",
          transition: "transform 0.2s ease",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        {header}
        {body}
      </div>
    );
  }

  if (!open) return null;

  return (
    <div className="relative h-full shrink-0" style={{ width }}>
      <Rnd
        default={{ x: 0, y: 0, width, height: "100%" }}
        bounds="window"
        dragHandleClassName="panel-drag"
        enableResizing={{ right: side === "left", left: side === "right" }}
        minWidth={220}
        maxWidth={420}
        style={{ zIndex: 30 }}
      >
        <div
          className="flex h-full flex-col overflow-hidden border shadow-xl"
          style={{
            background: "var(--bg-panel)",
            borderColor: "var(--border)",
            borderRadius: 2,
          }}
        >
          {header}
          {body}
        </div>
      </Rnd>
    </div>
  );
}
