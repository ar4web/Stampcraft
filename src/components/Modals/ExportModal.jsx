import { useState } from "react";
import { Download, FileCode2 } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { CANVAS_SIZE } from "../../utils/canvas";
import { doExportPNG, doExportSVG } from "../../utils/actions";
import Modal from "./Modal";

const OPTIONS = [
  { m: 1, label: "1× Screen", note: "Web preview" },
  { m: 2, label: "2× Retina", note: "Crisp digital use" },
  { m: 3, label: "3× Print", note: "Recommended for stamp makers" },
  { m: 4, label: "4× Ultra", note: "Large format / engraving" },
];

export default function ExportModal() {
  const closeModal = useStampStore((s) => s.closeModal);
  const [multiplier, setMultiplier] = useState(3);

  const px = Math.round(CANVAS_SIZE * multiplier);

  return (
    <Modal
      title="Export stamp"
      subtitle="Transparent background PNG, or a clean scalable SVG"
      onClose={closeModal}
      width={560}
    >
      <div className="mb-4 grid grid-cols-2 gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.m}
            onClick={() => setMultiplier(o.m)}
            className="rounded-xl border p-3 text-left"
            style={{
              borderColor: multiplier === o.m ? "var(--accent)" : "var(--border)",
              background:
                multiplier === o.m
                  ? "color-mix(in srgb, var(--accent) 12%, transparent)"
                  : "transparent",
            }}
          >
            <p className="text-xs font-bold">{o.label}</p>
            <p className="text-[10px]" style={{ color: "var(--text-dim)" }}>
              {o.note}
            </p>
            <p className="mt-1 text-[10px] tabular-nums" style={{ color: "var(--text-dim)" }}>
              {CANVAS_SIZE * o.m} × {CANVAS_SIZE * o.m} px
            </p>
          </button>
        ))}
      </div>

      <div
        className="mb-4 rounded-xl border p-3 text-[11px]"
        style={{ borderColor: "var(--border)", color: "var(--text-dim)" }}
      >
        Output: <strong style={{ color: "var(--text)" }}>stamp-{"{timestamp}"}.png</strong> ·{" "}
        {px}×{px}px · transparent background
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className="btn btn-accent flex-1"
          onClick={() => {
            doExportPNG(multiplier);
            closeModal();
          }}
        >
          <Download size={14} /> Download PNG @{multiplier}×
        </button>
        <button
          className="btn flex-1"
          onClick={() => {
            doExportPNG(1);
          }}
        >
          <Download size={14} /> 1× copy
        </button>
        <button
          className="btn flex-1"
          onClick={() => {
            doExportSVG();
            closeModal();
          }}
        >
          <FileCode2 size={14} /> Vector SVG
        </button>
      </div>
    </Modal>
  );
}
