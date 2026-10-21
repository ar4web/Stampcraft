import { useState } from "react";
import { RotateCcw, Sparkles } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { applyInkTexture, removeInkTexture, selectionKind } from "../../utils/canvas";
import { Row } from "../ui";

const PRESETS = [
  { label: "Light", amount: 25, mode: "distress" },
  { label: "Medium", amount: 45, mode: "distress" },
  { label: "Heavy", amount: 70, mode: "distress" },
  { label: "Rough", amount: 55, mode: "rough" },
  { label: "Aged", amount: 50, mode: "aged" },
];

export default function DistressTool() {
  const selected = useStampStore((s) => s.selected);
  const canvas = useStampStore((s) => s.canvas);
  const commit = useStampStore((s) => s.commit);
  const syncSelection = useStampStore((s) => s.syncSelection);
  const toast = useStampStore((s) => s.toast);
  const [busy, setBusy] = useState(false);
  const kind = selectionKind(selected);
  const isTextured = kind === "textured";

  const apply = async (amount, mode = "distress") => {
    if (!selected || !canvas) {
      toast("Select a layer first", "info");
      return;
    }
    setBusy(true);
    try {
      await applyInkTexture(canvas, selected, amount, mode);
      commit();
      syncSelection();
      const names = { distress: "distress", rough: "rough edge", aged: "old paper" };
      toast(`Applied ${names[mode]} at ${amount}%`, "success");
    } catch (err) {
      toast(`Effect failed: ${err.message}`, "error");
    } finally {
      setBusy(false);
    }
  };

  const clean = async () => {
    if (!selected || !canvas) return;
    setBusy(true);
    try {
      await removeInkTexture(canvas, selected);
      commit();
      syncSelection();
      toast("Restored clean vector", "info");
    } catch (err) {
      toast(`Restore failed: ${err.message}`, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2.5">
      <Row label="Ink wear" hint={selected ? "on selection" : "select a layer"}>
        <div className="grid grid-cols-3 gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              disabled={busy}
              onClick={() => apply(p.amount, p.mode)}
              className="btn flex-col !gap-1 !px-0"
              style={{ minHeight: 48 }}
            >
              <Sparkles size={13} />
              <span className="text-[9px] font-semibold">{p.label}</span>
            </button>
          ))}
        </div>
      </Row>
      {isTextured && (
        <button type="button" disabled={busy} onClick={clean} className="btn btn-danger w-full text-[10px]">
          <RotateCcw size={12} />
          Restore vector
        </button>
      )}
      <p className="text-[9px] leading-relaxed" style={{ color: "var(--text-mute)" }}>
        Worn rubber on paper. Rasterizes the selected layer. Restore vector undoes it.
      </p>
    </div>
  );
}
