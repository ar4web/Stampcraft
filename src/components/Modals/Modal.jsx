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
      style={{ background: "rgba(5,7,12,0.75)" }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="toast-in flex max-h-[88vh] w-full flex-col overflow-hidden border shadow-2xl"
        style={{ background: "var(--bg-panel)", borderColor: "var(--border)", maxWidth: width }}
      >
        <div
          className="flex items-center gap-3 border-b px-4 py-3"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex-1">
            <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
            {subtitle && (
              <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
                {subtitle}
              </p>
            )}
          </div>
          <button type="button" className="btn btn-icon" aria-label="Close dialog" onClick={onClose}>
            <X size={15} />
          </button>
        </div>
        <div className="scroll-thin flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
