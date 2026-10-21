import { useState } from "react";
import { Download, FileImage, Layers as LayersIcon, Sparkles } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { doExportJPG, doExportPNG, doExportSVG } from "../../utils/actions";

export default function ExportPanel() {
  const { designName, setDesignName, saveCurrent, saveAsNew, openModal, dirty } =
    useStampStore();
  const [surface, setSurface] = useState("transparent");
  const transparentOnly = surface === "transparent";
  const trim = surface === "trim";

  const opts = { transparentOnly, trim };

  return (
    <div className="space-y-3">
      {/* Design Name Input */}
      <div>
        <label className="label mb-1 text-[10px]">Stamp Title</label>
        <input
          className="field text-xs font-medium"
          aria-label="Design name"
          value={designName}
          onChange={(e) => setDesignName(e.target.value)}
          placeholder="Design name"
        />
      </div>

      {/* Save & Copy actions */}
      <div className="grid grid-cols-3 gap-1">
        <button
          type="button"
          className="btn text-[10px] font-semibold"
          onClick={() => saveCurrent()}
        >
          Save{dirty ? "*" : ""}
        </button>
        <button
          type="button"
          className="btn text-[10px]"
          onClick={() => saveAsNew()}
        >
          Duplicate
        </button>
        <button
          type="button"
          className="btn text-[10px]"
          onClick={() => openModal("saveload")}
        >
          Library
        </button>
      </div>

      {/* Surface Background Style */}
      <div>
        <label className="label mb-1 text-[10px]">Background</label>
        <div className="grid grid-cols-3 gap-1">
          {[
            { id: "transparent", label: "Clear" },
            { id: "solid", label: "Canvas" },
            { id: "trim", label: "Trim" },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              className={`btn text-[10px] py-1 ${surface === s.id ? "btn-on" : ""}`}
              aria-pressed={surface === s.id}
              onClick={() => setSurface(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Export Quick Buttons with Icons and Labels */}
      <div>
        <label className="label mb-1 text-[10px]">Quick Download</label>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            className="btn flex flex-col items-center justify-center py-2 h-auto text-[10px] font-bold gap-1"
            onClick={() => doExportPNG(3, opts)}
            title="Download transparent PNG (3x resolution)"
          >
            <FileImage size={15} style={{ color: "var(--accent)" }} />
            <span>PNG</span>
          </button>
          <button
            type="button"
            className="btn flex flex-col items-center justify-center py-2 h-auto text-[10px] font-bold gap-1"
            onClick={() => doExportSVG({ transparentOnly })}
            title="Download scalable SVG vector"
          >
            <Sparkles size={15} style={{ color: "var(--accent)" }} />
            <span>SVG</span>
          </button>
          <button
            type="button"
            className="btn flex flex-col items-center justify-center py-2 h-auto text-[10px] font-bold gap-1"
            onClick={() => doExportJPG(3, { trim })}
            title="Download high-resolution JPG"
          >
            <LayersIcon size={15} style={{ color: "var(--accent)" }} />
            <span>JPG</span>
          </button>
        </div>
      </div>

      {/* Open full export modal */}
      <button
        type="button"
        className="btn btn-accent w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold"
        onClick={() => openModal("download")}
      >
        <Download size={14} /> Full Export Options...
      </button>
    </div>
  );
}
