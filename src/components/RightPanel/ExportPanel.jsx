import { useState } from "react";
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
    <div className="flex gap-1.5">
      <div className="min-w-0 flex-1 space-y-1.5">
        <input
          className="field"
          aria-label="Design name"
          value={designName}
          onChange={(e) => setDesignName(e.target.value)}
          placeholder="Design name"
        />
        <div className="flex gap-1">
          <button type="button" className="btn flex-1 !px-1 text-[9px]" onClick={() => saveCurrent()}>
            Save{dirty ? "*" : ""}
          </button>
          <button type="button" className="btn flex-1 !px-1 text-[9px]" onClick={() => saveAsNew()}>
            Copy
          </button>
          <button type="button" className="btn flex-1 !px-1 text-[9px]" onClick={() => openModal("saveload")}>
            Saved
          </button>
        </div>
        <div className="flex gap-1">
          {[
            { id: "transparent", label: "Clear" },
            { id: "solid", label: "Solid" },
            { id: "trim", label: "Trim" },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              className={`btn flex-1 !px-1 text-[9px] ${surface === s.id ? "btn-on" : ""}`}
              aria-pressed={surface === s.id}
              onClick={() => setSurface(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex w-12 shrink-0 flex-col gap-1">
        <button
          type="button"
          className="btn flex-1 !px-0 text-[9px] font-semibold"
          onClick={() => doExportPNG(3, opts)}
        >
          PNG
        </button>
        <button
          type="button"
          className="btn flex-1 !px-0 text-[9px] font-semibold"
          onClick={() => doExportJPG(3, { trim })}
        >
          JPG
        </button>
        <button
          type="button"
          className="btn flex-1 !px-0 text-[9px] font-semibold"
          onClick={() => doExportSVG({ transparentOnly })}
        >
          SVG
        </button>
      </div>
    </div>
  );
}
