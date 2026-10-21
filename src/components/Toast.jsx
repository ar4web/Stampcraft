import { Check, Info, X, AlertTriangle } from "lucide-react";
import useStampStore from "../store/useStampStore";

const ICONS = {
  success: Check,
  error: AlertTriangle,
  info: Info,
};

const TINTS = {
  success: "var(--ok)",
  error: "var(--danger)",
  info: "var(--text-dim)",
};

export default function ToastHost() {
  const toasts = useStampStore((s) => s.toasts);
  const dismiss = useStampStore((s) => s.dismissToast);
  const t = toasts[0];
  if (!t) return null;

  const Icon = ICONS[t.type] || Info;
  const tint = TINTS[t.type] || TINTS.info;

  return (
    <div
      className="pointer-events-none fixed z-[90] flex w-[min(72vw,280px)] justify-center"
      style={{
        left: "50%",
        top: "calc(var(--bar-h) + 8px)",
        transform: "translateX(-50%)",
      }}
    >
      <div
        className="toast-in pointer-events-auto flex w-full items-center gap-2 px-2.5 py-1.5"
        style={{ background: "var(--bg-raised)", color: "var(--text)" }}
      >
        <Icon size={12} style={{ color: tint }} className="shrink-0" />
        <p className="min-w-0 flex-1 truncate text-[10px] leading-snug">{t.message}</p>
        {t.action && (
          <button
            type="button"
            className="shrink-0 text-[9px] font-semibold uppercase tracking-wide"
            style={{ color: "var(--text-dim)" }}
            onClick={() => {
              t.action.onClick();
              dismiss(t.id);
            }}
          >
            {t.action.label}
          </button>
        )}
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={() => dismiss(t.id)}
          className="grid h-5 w-5 shrink-0 place-items-center"
          style={{ color: "var(--text-mute)" }}
        >
          <X size={11} />
        </button>
      </div>
    </div>
  );
}
