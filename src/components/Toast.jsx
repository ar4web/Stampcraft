import { CheckCircle2, Info, X, AlertTriangle } from "lucide-react";
import useStampStore from "../store/useStampStore";

const ICONS = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
};

const TINTS = {
  success: "#22c55e",
  error: "#ef4444",
  info: "#6366f1",
};

export default function ToastHost() {
  const toasts = useStampStore((s) => s.toasts);
  const dismiss = useStampStore((s) => s.dismissToast);

  return (
    <div className="pointer-events-none fixed left-1/2 top-16 z-[90] flex w-[min(92vw,420px)] -translate-x-1/2 flex-col gap-2">
      {toasts.map((t) => {
        const Icon = ICONS[t.type] || Info;
        const tint = TINTS[t.type] || TINTS.info;
        return (
          <div
            key={t.id}
            className="toast-in pointer-events-auto flex items-start gap-2.5 rounded-xl border px-3 py-2.5 shadow-xl backdrop-blur"
            style={{
              background: "color-mix(in srgb, var(--bg-panel) 92%, transparent)",
              borderColor: tint,
            }}
          >
            <Icon size={16} style={{ color: tint }} className="mt-0.5 shrink-0" />
            <div className="flex-1 text-xs leading-relaxed" style={{ color: "var(--text)" }}>
              {t.message}
              {t.action && (
                <button
                  className="btn mt-2 w-full"
                  onClick={() => {
                    t.action.onClick();
                    dismiss(t.id);
                  }}
                >
                  {t.action.label}
                </button>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 opacity-60 hover:opacity-100"
              style={{ color: "var(--text-dim)" }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
