import { Maximize2, Minus, Plus, Ruler, Grid3x3 } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import Tooltip from "../Tooltip";

export default function ZoomControls() {
  const { zoom, setZoom, zoomBy, showRulers, toggleRulers, showGrid, toggleGrid } =
    useStampStore();

  return (
    <div
      className="absolute bottom-3 right-3 z-20 flex items-center gap-1 border px-1.5 py-1 shadow-2xl"
      style={{
        background: "var(--bg-panel)",
        borderColor: "var(--border)",
      }}
    >
      <Tooltip label="Toggle Rulers" hint="Metric mm / cm scale" side="top">
        <button
          type="button"
          className="btn !border-0"
          aria-pressed={showRulers}
          aria-label="Toggle rulers"
          onClick={toggleRulers}
          style={showRulers ? { color: "var(--accent)" } : undefined}
        >
          <Ruler size={16} />
        </button>
      </Tooltip>

      <Tooltip label="Toggle Grid" hint="Alignment grid" side="top">
        <button
          type="button"
          className="btn !border-0"
          aria-pressed={showGrid}
          aria-label="Toggle grid"
          onClick={toggleGrid}
          style={showGrid ? { color: "var(--accent)" } : undefined}
        >
          <Grid3x3 size={16} />
        </button>
      </Tooltip>

      <div className="h-5 w-px bg-[var(--border)]" />

      <Tooltip label="Zoom Out" hint="25%" side="top">
        <button
          type="button"
          className="btn !border-0"
          aria-label="Zoom out"
          onClick={() => zoomBy(-0.25)}
        >
          <Minus size={16} />
        </button>
      </Tooltip>

      <input
        type="range"
        min={50}
        max={400}
        step={5}
        value={Math.round(zoom * 100)}
        onChange={(e) => setZoom(Number(e.target.value) / 100)}
        className="hidden w-20 sm:block cursor-ew-resize"
        aria-label="Canvas zoom slider"
      />

      <span className="w-10 text-center text-[10px] font-semibold tabular-nums" style={{ color: "var(--text)" }}>
        {Math.round(zoom * 100)}%
      </span>

      <Tooltip label="Zoom In" hint="25%" side="top">
        <button
          type="button"
          className="btn !border-0"
          aria-label="Zoom in"
          onClick={() => zoomBy(0.25)}
        >
          <Plus size={16} />
        </button>
      </Tooltip>

      <Tooltip label="Reset 100%" hint="Actual size" side="top">
        <button
          type="button"
          className="btn !border-0"
          aria-label="Reset zoom to 100%"
          onClick={() => setZoom(1)}
        >
          <Maximize2 size={16} />
        </button>
      </Tooltip>
    </div>
  );
}
