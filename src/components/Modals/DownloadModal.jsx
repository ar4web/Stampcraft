import { useState } from "react";
import { Download, FileImage, Layers, ShieldCheck, Sparkles, Check } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { doExportJPG, doExportPNG, doExportSVG } from "../../utils/actions";
import { PRINT_BLEEDS, PRINT_DPI, PRINT_SIZES, printPixels } from "../../utils/print";
import { Checkbox } from "../ui";
import Modal from "./Modal";

export default function DownloadModal() {
  const { closeModal, designName, setDesignName } = useStampStore();
  const [format, setFormat] = useState("png"); // png | svg | jpg
  const [scale, setScale] = useState(3); // 1x, 2x, 3x, 4x
  const [surface, setSurface] = useState("transparent"); // transparent | solid | trim
  const [downloaded, setDownloaded] = useState(false);
  const [printMode, setPrintMode] = useState(true);
  const [sizeMm, setSizeMm] = useState(38);
  const [dpi, setDpi] = useState(300);
  const [bleedMm, setBleedMm] = useState(1);
  const [cmykSafe, setCmykSafe] = useState(true);

  const transparentOnly = surface === "transparent";
  const trim = surface === "trim";
  const px = printPixels(sizeMm, dpi, bleedMm);

  const handleDownload = () => {
    const opts = {
      transparentOnly,
      trim,
      cmykSafe,
      bumpSerial: true,
      name: designName,
      ...(printMode && format !== "svg" ? { sizeMm, dpi, bleedMm } : {}),
    };
    if (format === "png") {
      doExportPNG(printMode ? 1 : scale, opts);
    } else if (format === "jpg") {
      doExportJPG(printMode ? 1 : scale, { ...opts, transparentOnly: false });
    } else if (format === "svg") {
      doExportSVG({ transparentOnly, cmykSafe, bumpSerial: true, name: designName });
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

        {format !== "svg" && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label font-bold text-xs text-[var(--text)]">Print size</label>
              <button
                type="button"
                className={`btn !min-h-6 !px-2 text-[10px] ${printMode ? "btn-on" : ""}`}
                aria-pressed={printMode}
                onClick={() => setPrintMode((v) => !v)}
              >
                {printMode ? "mm / dpi" : "px scale"}
              </button>
            </div>
            {printMode ? (
              <>
                <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                  {PRINT_SIZES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSizeMm(s.mm)}
                      className={`p-2 border rounded text-center ${
                        sizeMm === s.mm
                          ? "border-[var(--accent)] bg-[var(--accent-dim)]"
                          : "border-[var(--border)]"
                      }`}
                    >
                      <div className="text-xs font-bold">{s.label}</div>
                      <div className="text-[9px]" style={{ color: "var(--text-dim)" }}>{s.hint}</div>
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                  {PRINT_DPI.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDpi(d)}
                      className={`btn ${dpi === d ? "btn-on" : ""}`}
                    >
                      {d} dpi
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {PRINT_BLEEDS.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBleedMm(b)}
                      className={`btn ${bleedMm === b ? "btn-on" : ""}`}
                    >
                      {b ? `${b} mm` : "No bleed"}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-[10px] tabular-nums" style={{ color: "var(--text-dim)" }}>
                  {px.total} × {px.total} px including bleed
                </p>
              </>
            ) : (
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { s: 1, label: "1x", hint: "600px" },
                  { s: 2, label: "2x", hint: "1200px" },
                  { s: 3, label: "3x", hint: "1800px" },
                  { s: 4, label: "4x", hint: "2400px" },
                ].map((item) => (
                  <button
                    key={item.s}
                    type="button"
                    onClick={() => setScale(item.s)}
                    className={`p-2 border rounded text-center ${
                      scale === item.s
                        ? "border-[var(--accent)] bg-[var(--accent-dim)]"
                        : "border-[var(--border)]"
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[9px]" style={{ color: "var(--text-dim)" }}>{item.hint}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Background / Crop options */}
        <div>
          <label className="label mb-1.5 font-bold text-xs text-[var(--text)]">
            Background Transparency
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: "transparent", label: "Stamp only", desc: "No paper in file" },
              { id: "solid", label: "Include paper", desc: "Keep canvas colour" },
              { id: "trim", label: "Tight trim", desc: "Cropped to ink" },
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

        <Checkbox
          label="CMYK-safe ink"
          checked={cmykSafe}
          onChange={setCmykSafe}
          hint="Maps screen RGB to printable CMYK-safe colours for this download only."
        />

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
