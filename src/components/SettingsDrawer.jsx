import { useEffect, useRef } from "react";
import { Settings2, X } from "lucide-react";
import useStampStore from "../store/useStampStore";
import SettingsPanel from "./SettingsPanel";
import ErrorBoundary from "./ErrorBoundary";

/**
 * Standalone Settings menu. It is NOT a sidebar section: it slides in over
 * the workspace, closes on Esc / backdrop click, and the normal tool panels
 * are visible again as soon as it closes.
 */
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
          background: "rgba(5,7,12,0.65)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity .18s ease",
        }}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        aria-hidden={!open}
        className="settings-drawer fixed bottom-0 right-0 top-0 z-[70] flex w-[min(410px,94vw)] flex-col border-l shadow-2xl"
        style={{
          background: "var(--bg-panel)",
          borderColor: "var(--border)",
          transform: open ? "translateX(0)" : "translateX(102%)",
          visibility: open ? "visible" : "hidden",
          transition: "transform .22s ease, visibility .22s",
        }}
      >
        <div
          className="flex h-11 shrink-0 items-center gap-2 border-b px-3"
          style={{ borderColor: "var(--border)", background: "var(--bg-raised)" }}
        >
          <Settings2 size={15} style={{ color: "var(--text-dim)" }} />
          <div className="flex-1">
            <h2 className="text-[12px] font-semibold leading-tight">Studio</h2>
            <p className="text-[10px] leading-tight" style={{ color: "var(--text-mute)" }}>
              Setup defaults, files, and recover if something breaks
            </p>
          </div>
          <button type="button" className="btn btn-ghost btn-icon" onClick={close} aria-label="Close settings" title="Close settings">
            <X size={15} />
          </button>
        </div>
        <div className="scroll-thin flex-1 overflow-y-auto p-3">
          {open && (
            <ErrorBoundary compact>
              <SettingsPanel />
            </ErrorBoundary>
          )}
        </div>
        <div className="shrink-0 border-t px-3 py-2.5 text-[12px]" style={{ borderColor: "var(--border-soft)", color: "var(--text-dim)" }}>
          Saved in this browser. Esc closes. Fix tab recovers a stuck session.
        </div>
      </aside>
    </>
  );
}
