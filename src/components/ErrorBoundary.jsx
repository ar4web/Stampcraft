import { Component } from "react";
import { AlertTriangle, RotateCcw, Trash2 } from "lucide-react";

/**
 * Last-resort safety net. If any panel ever throws while rendering, the user
 * sees a clear message with recovery actions instead of a blank page.
 */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[Stampcraft] render error:", error, info);
  }

  reload = () => window.location.reload();

  resetPrefs = () => {
    try {
      // Preferences only — saved designs (stamp_designs) are kept.
      localStorage.removeItem("stamp_prefs");
      localStorage.removeItem("stamp_theme");
      localStorage.removeItem("stamp_autosave");
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    if (this.props.compact) {
      return (
        <div className="border p-3 text-center" style={{ borderColor: "var(--danger, #ef4444)" }}>
          <AlertTriangle size={18} className="mx-auto mb-2" style={{ color: "var(--danger, #ef4444)" }} />
          <p className="mb-1 text-[11px] font-semibold">This panel failed to load</p>
          <p className="mb-3 text-[10px]" style={{ color: "var(--text-dim)" }}>
            {String(error.message || error).slice(0, 120)}
          </p>
          <div className="flex gap-1.5">
            <button className="btn flex-1" onClick={this.reload}>
              <RotateCcw size={12} /> Reload
            </button>
            <button className="btn flex-1" onClick={this.resetPrefs}>
              <Trash2 size={12} /> Reset settings
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid h-full w-full place-items-center p-4" style={{ background: "var(--bg-primary)" }}>
        <div className="w-[min(92vw,380px)] border p-5 text-center" style={{ background: "var(--bg-panel)", borderColor: "var(--border)" }}>
          <AlertTriangle size={26} className="mx-auto mb-3" style={{ color: "var(--danger, #ef4444)" }} />
          <h1 className="mb-1 text-sm font-bold">Stampcraft hit a problem</h1>
          <p className="mb-4 text-[11px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
            {String(error.message || error).slice(0, 160)}
          </p>
          <div className="flex gap-2">
            <button className="btn btn-accent flex-1" onClick={this.reload}>
              <RotateCcw size={13} /> Reload app
            </button>
            <button className="btn flex-1" onClick={this.resetPrefs}>
              <Trash2 size={13} /> Reset settings
            </button>
          </div>
          <p className="mt-3 text-[10px]" style={{ color: "var(--text-dim)" }}>
            Resetting settings keeps your saved designs.
          </p>
        </div>
      </div>
    );
  }
}
