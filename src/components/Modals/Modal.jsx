import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({ title, subtitle, onClose, children, width = 720 }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-3"
      style={{ background: "rgba(5,6,10,0.65)", backdropFilter: "blur(3px)" }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="toast-in flex max-h-[88vh] w-full flex-col overflow-hidden rounded-2xl border shadow-2xl"
        style={{ background: "var(--bg-panel)", borderColor: "var(--border)", maxWidth: width }}
      >
        <div
          className="flex items-center gap-3 border-b px-4 py-3"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex-1">
            <h2 className="text-sm font-bold">{title}</h2>
            {subtitle && (
              <p className="text-[11px]" style={{ color: "var(--text-dim)" }}>
                {subtitle}
              </p>
            )}
          </div>
          <button className="btn !px-2" onClick={onClose}>
            <X size={15} />
          </button>
        </div>
        <div className="scroll-thin flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
