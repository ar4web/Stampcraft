import { Maximize2, Minus, Plus, Ruler, Grid3x3 } from "lucide-react";
import useStampStore from "../../store/useStampStore";

export default function ZoomControls() {
  const { zoom, setZoom, zoomBy, showRulers, toggleRulers, showGrid, toggleGrid } =
    useStampStore();

  return (
    <div
      className="absolute bottom-3 right-3 z-20 flex items-center gap-1 rounded-xl border p-1 shadow-lg backdrop-blur"
      style={{
        background: "color-mix(in srgb, var(--bg-panel) 90%, transparent)",
        borderColor: "var(--border)",
      }}
    >
      <button className="btn !border-0 !px-1.5" title="Toggle rulers" onClick={toggleRulers}
        style={showRulers ? { color: "var(--accent)" } : undefined}>
        <Ruler size={14} />
      </button>
      <button className="btn !border-0 !px-1.5" title="Toggle grid" onClick={toggleGrid}
        style={showGrid ? { color: "var(--accent)" } : undefined}>
        <Grid3x3 size={14} />
      </button>
      <div className="h-5 w-px" style={{ background: "var(--border)" }} />
      <button className="btn !border-0 !px-1.5" title="Zoom out" onClick={() => zoomBy(-0.25)}>
        <Minus size={14} />
      </button>
      <input
        type="range"
        min={50}
        max={400}
        step={5}
        value={Math.round(zoom * 100)}
        onChange={(e) => setZoom(Number(e.target.value) / 100)}
        className="hidden w-24 sm:block"
        aria-label="Zoom"
      />
      <span className="w-11 text-center text-[11px] font-semibold tabular-nums">
        {Math.round(zoom * 100)}%
      </span>
      <button className="btn !border-0 !px-1.5" title="Zoom in" onClick={() => zoomBy(0.25)}>
        <Plus size={14} />
      </button>
      <button className="btn !border-0 !px-1.5" title="Reset to 100%" onClick={() => setZoom(1)}>
        <Maximize2 size={14} />
      </button>
    </div>
  );
}
