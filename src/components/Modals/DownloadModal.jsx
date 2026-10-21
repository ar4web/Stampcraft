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
      width={560}
    >
      <div className="space-y-3.5">
        {/* Quick Format Selector - Large, easily clickable targets */}
        <div>
          <label className="label mb-1.5 font-bold text-xs text-[var(--text)]">
            Select Format
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setFormat("png")}
              className={`flex flex-col items-start gap-1 p-2.5 sm:p-3 border rounded text-left transition-all ${
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
              <span className="text-[10px] text-[var(--text-dim)] leading-tight">
                Transparent alpha for docs & PDFs
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFormat("svg")}
              className={`flex flex-col items-start gap-1 p-2.5 sm:p-3 border rounded text-left transition-all ${
                format === "svg"
                  ? "border-[var(--accent)] bg-[var(--accent-dim)] ring-1 ring-[var(--accent)]"
                  : "border-[var(--border)] hover:bg-[var(--bg-raised)]"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-xs flex items-center gap-1.5 text-[var(--text)]">
                  <Sparkles size={15} style={{ color: "var(--accent)" }} /> SVG
                </span>
                {format === "svg" && <Check size={14} style={{ color: "var(--accent)" }} />}
              </div>
              <span className="text-[10px] text-[var(--text-dim)] leading-tight">
                Infinite vector curve for print & laser
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFormat("jpg")}
              className={`flex flex-col items-start gap-1 p-2.5 sm:p-3 border rounded text-left transition-all ${
                format === "jpg"
                  ? "border-[var(--accent)] bg-[var(--accent-dim)] ring-1 ring-[var(--accent)]"
                  : "border-[var(--border)] hover:bg-[var(--bg-raised)]"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-bold text-xs flex items-center gap-1.5 text-[var(--text)]">
                  <Layers size={15} style={{ color: "var(--accent)" }} /> JPG
                </span>
                {format === "jpg" && <Check size={14} style={{ color: "var(--accent)" }} />}
              </div>
              <span className="text-[10px] text-[var(--text-dim)] leading-tight">
                Solid white background image
              </span>
            </button>
          </div>
        </div>

        {/* Quality / Resolution Row (for PNG & JPG) */}
        {format !== "svg" && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label font-bold text-xs text-[var(--text)]">
                Resolution Size
              </label>
              <span className="text-[11px] font-mono text-[var(--accent)] font-semibold">
                {scale * 600} × {scale * 600} px ({scale}x DPI)
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { s: 1, label: "1x", hint: "600px" },
                { s: 2, label: "2x", hint: "1200px" },
                { s: 3, label: "3x (HD)", hint: "1800px" },
                { s: 4, label: "4x (Ultra)", hint: "2400px" },
              ].map((item) => (
                <button
                  key={item.s}
                  type="button"
                  onClick={() => setScale(item.s)}
                  className={`p-2 border rounded text-center transition-all ${
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
          <label className="label mb-1.5 font-bold text-xs text-[var(--text)]">
            Background Transparency
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: "transparent", label: "Transparent", desc: "No background" },
              { id: "solid", label: "Canvas Color", desc: "Paper background" },
              { id: "trim", label: "Tight Trim", desc: "Cropped to ink" },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSurface(s.id)}
                className={`p-2 border rounded text-left transition-all ${
                  surface === s.id
                    ? "border-[var(--accent)] bg-[var(--accent-dim)] ring-1 ring-[var(--accent)]"
                    : "border-[var(--border)] hover:bg-[var(--bg-raised)]"
                }`}
              >
                <div className="text-xs font-bold text-[var(--text)]">{s.label}</div>
                <div className="text-[9px] text-[var(--text-dim)]">{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* File Name Row */}
        <div>
          <label className="label mb-1 font-bold text-xs text-[var(--text)]">
            File Name
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              className="field h-9 text-xs font-medium"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              placeholder="Enter stamp name..."
            />
            <span
              className="absolute right-2.5 text-[11px] font-semibold uppercase px-1.5 py-0.5 rounded"
              style={{ background: "var(--bg-raised)", color: "var(--text-dim)" }}
            >
              .{format}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t pt-3 mt-1" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-dim)" }}>
            <ShieldCheck size={14} style={{ color: "var(--accent)" }} />
            <span>Ready for instant download</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn px-3 h-8 text-xs"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="btn btn-accent px-4 h-8 text-xs font-bold flex items-center gap-1.5 shadow-lg active:scale-95"
            >
              {downloaded ? (
                <>
                  <Check size={15} /> Downloaded!
                </>
              ) : (
                <>
                  <Download size={15} /> Download {format.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
