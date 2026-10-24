import { useEffect, useRef } from "react";
import { Settings2, X } from "lucide-react";
import useStampStore from "../store/useStampStore";
import SettingsPanel from "./SettingsPanel";
import ErrorBoundary from "./ErrorBoundary";

export default function SettingsDrawer() {
  const open = useStampStore((s) => s.settingsOpen);
  const close = useStampStore((s) => s.closeSettings);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => panelRef.current?.querySelector("button")?.focus(), 60);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open, close]);

  return (
    <>
      <div
        aria-hidden={!open}
        onClick={close}
        className="fixed inset-0 z-[68]"
        style={{
          background: "var(--scrim)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity .18s var(--ease)",
        }}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Preferences"
        aria-hidden={!open}
        className="settings-drawer fixed bottom-0 right-0 top-0 z-[70] flex w-[min(520px,96vw)] flex-col border-l"
        style={{
          background: "var(--bg-panel)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow)",
          transform: open ? "translateX(0)" : "translateX(102%)",
          visibility: open ? "visible" : "hidden",
          transition: "transform .28s var(--ease), visibility .28s",
        }}
      >
        <div
          className="flex h-12 shrink-0 items-center gap-2.5 border-b px-4"
          style={{ borderColor: "var(--border)", background: "var(--bg-raised)" }}
        >
          <span
            className="grid h-8 w-8 place-items-center"
            style={{ background: "var(--accent-dim)", borderRadius: "var(--radius)", color: "var(--accent)" }}
          >
            <Settings2 size={16} aria-hidden />
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="text-[14px] font-semibold leading-tight tracking-tight">Preferences</h2>
            <p className="text-[11px] leading-tight" style={{ color: "var(--text-mute)" }}>
              Appearance, files, and recovery
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={close}
            aria-label="Close preferences"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
          {open ? (
            <ErrorBoundary compact>
              <SettingsPanel />
            </ErrorBoundary>
          ) : null}
        </div>
        <div
          className="shrink-0 border-t px-4 py-2.5 text-[11px] leading-relaxed"
          style={{ borderColor: "var(--border-soft)", color: "var(--text-mute)", background: "var(--bg-raised)" }}
        >
          Stored in this browser. Esc closes.
        </div>
      </aside>
    </>
  );
}
