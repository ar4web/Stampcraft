import { useState } from "react";
import { Download, FileImage, Layers, ShieldCheck, Sparkles, Check } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { doExportJPG, doExportPNG, doExportSVG } from "../../utils/actions";
import Modal from "./Modal";

export default function DownloadModal() {
  const { closeModal, designName, setDesignName } = useStampStore();
  const [format, setFormat] = useState("png"); // png | svg | jpg
  const [scale, setScale] = useState(3); // 1x, 2x, 3x, 4x
  const [surface, setSurface] = useState("transparent"); // transparent | solid | trim
  const [downloaded, setDownloaded] = useState(false);

  const transparentOnly = surface === "transparent";
  const trim = surface === "trim";

  const handleDownload = () => {
    const opts = { transparentOnly, trim };
    if (format === "png") {
      doExportPNG(scale, opts);
    } else if (format === "jpg") {
      doExportJPG(scale, { trim });
    } else if (format === "svg") {
      doExportSVG({ transparentOnly });
    }
    setDownloaded(true);
    setTimeout(() => {
      setDownloaded(false);
      closeModal();
    }, 700);
  };

  return (
    <Modal
      title="Export & Download Stamp"
      subtitle="Save your stamp design in ultra high resolution ready for print, documents, or digital sealing"
      onClose={closeModal}
      width={600}
    >
      <div className="space-y-4">
        {/* File Name Row */}
        <div>
          <label className="label mb-1.5 font-semibold text-xs text-[var(--text)]">
            File Name
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              className="field h-10 text-sm font-medium"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              placeholder="Enter stamp name..."
            />
            <span
              className="absolute right-3 text-xs font-semibold uppercase px-1.5 py-0.5 rounded"
              style={{ background: "var(--bg-raised)", color: "var(--text-dim)" }}
            >
              .{format}
            </span>
          </div>
        </div>

        {/* Format Selector */}
        <div>
          <label className="label mb-1.5 font-semibold text-xs text-[var(--text)]">
            Choose Format
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setFormat("png")}
              className={`flex flex-col items-start gap-1 p-3 border text-left transition-all ${
                format === "png"
                  ? "border-[var(--accent)] bg-[var(--accent-dim)] ring-1 ring-[var(--accent)]"
                  : "border-[var(--border)] hover:bg-[var(--bg-raised)]"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-xs flex items-center gap-1.5 text-[var(--text)]">
                  <FileImage size={15} style={{ color: "var(--accent)" }} /> PNG
                </span>
                {format === "png" && <Check size={14} style={{ color: "var(--accent)" }} />}
              </div>
              <span className="text-[10px]" style={{ color: "var(--text-dim)" }}>
                Transparent alpha, perfect for docs & overlays
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFormat("svg")}
              className={`flex flex-col items-start gap-1 p-3 border text-left transition-all ${
                format === "svg"
                  ? "border-[var(--accent)] bg-[var(--accent-dim)] ring-1 ring-[var(--accent)]"
                  : "border-[var(--border)] hover:bg-[var(--bg-raised)]"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-xs flex items-center gap-1.5 text-[var(--text)]">
                  <Sparkles size={15} style={{ color: "var(--accent)" }} /> SVG Vector
                </span>
                {format === "svg" && <Check size={14} style={{ color: "var(--accent)" }} />}
              </div>
              <span className="text-[10px]" style={{ color: "var(--text-dim)" }}>
                Infinitely scalable vector curve, ideal for CNC/laser
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFormat("jpg")}
              className={`flex flex-col items-start gap-1 p-3 border text-left transition-all ${
                format === "jpg"
                  ? "border-[var(--accent)] bg-[var(--accent-dim)] ring-1 ring-[var(--accent)]"
                  : "border-[var(--border)] hover:bg-[var(--bg-raised)]"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-xs flex items-center gap-1.5 text-[var(--text)]">
                  <Layers size={15} style={{ color: "var(--accent)" }} /> JPG Photo
                </span>
                {format === "jpg" && <Check size={14} style={{ color: "var(--accent)" }} />}
              </div>
              <span className="text-[10px]" style={{ color: "var(--text-dim)" }}>
                Solid white background, lightweight photo standard
              </span>
            </button>
          </div>
        </div>

        {/* Quality / Resolution Row (for PNG & JPG) */}
        {format !== "svg" && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label font-semibold text-xs text-[var(--text)]">
                Resolution & Quality
              </label>
              <span className="text-[11px] font-mono text-[var(--accent)]">
                {scale * 600} × {scale * 600} px ({scale}x DPI)
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { s: 1, label: "Standard", hint: "600px" },
                { s: 2, label: "Medium", hint: "1200px" },
                { s: 3, label: "High (3x)", hint: "1800px" },
                { s: 4, label: "Ultra HD", hint: "2400px" },
              ].map((item) => (
                <button
                  key={item.s}
                  type="button"
                  onClick={() => setScale(item.s)}
                  className={`p-2 border text-center transition-all ${
                    scale === item.s
                      ? "border-[var(--accent)] bg-[var(--accent-dim)] ring-1 ring-[var(--accent)]"
                      : "border-[var(--border)] hover:bg-[var(--bg-raised)]"
                  }`}
                >
                  <div className="text-xs font-bold text-[var(--text)]">{item.label}</div>
                  <div className="text-[9px] text-[var(--text-dim)]">{item.hint}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Background / Crop options */}
        <div>
          <label className="label mb-1.5 font-semibold text-xs text-[var(--text)]">
            Background & Trim
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "transparent", label: "Transparent", desc: "No background colour" },
              { id: "solid", label: "Solid Canvas", desc: "Includes canvas paper colour" },
              { id: "trim", label: "Auto-Trimmed", desc: "Crops to exact ink borders" },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSurface(s.id)}
                className={`p-2.5 border text-left transition-all ${
                  surface === s.id
                    ? "border-[var(--accent)] bg-[var(--accent-dim)] ring-1 ring-[var(--accent)]"
                    : "border-[var(--border)] hover:bg-[var(--bg-raised)]"
                }`}
              >
                <div className="text-xs font-semibold text-[var(--text)]">{s.label}</div>
                <div className="text-[9px] text-[var(--text-dim)]">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t pt-4 mt-2" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-dim)" }}>
            <ShieldCheck size={15} style={{ color: "var(--accent)" }} />
            <span>100% Free · Client-Side Rendered</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn px-4 h-9 text-xs"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="btn btn-accent px-5 h-9 text-xs font-bold flex items-center gap-2 shadow-lg"
            >
              {downloaded ? (
                <>
                  <Check size={16} /> Downloaded!
                </>
              ) : (
                <>
                  <Download size={16} /> Download {format.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
