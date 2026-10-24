import { useState } from "react";
import { Plus, Type } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { CANVAS_SIZE, createSpecObject, rebuildArc, selectionKind } from "../../utils/canvas";
import { addObject } from "../../utils/actions";
import { fontForScript, loadFont } from "../../utils/fonts";
import { isRTL } from "../../utils/arabic";
import { Row } from "../ui";

const PRESETS = ["APPROVED", "CONFIDENTIAL", "RECEIVED", "PAID", "ORIGINAL", "VERIFIED"];

const WEIGHTS = [
  { v: "300", label: "Lt" },
  { v: "400", label: "Rg" },
  { v: "700", label: "Bd" },
  { v: "900", label: "Blk" },
];

export default function TextTool() {
  const inkColor = useStampStore((s) => s.inkColor);
  const toast = useStampStore((s) => s.toast);
  const canvas = useStampStore((s) => s.canvas);
  const selected = useStampStore((s) => s.selected);
  const selVersion = useStampStore((s) => s.selVersion);
  const commit = useStampStore((s) => s.commit);
  const touch = useStampStore((s) => s.touchSelection);
  void selVersion;

  const selKind = selectionKind(selected);
  const editingSelection = selKind === "text" || selKind === "arc";
  const selText = editingSelection
    ? selKind === "arc"
      ? selected.stampMeta?.text || ""
      : selected.text || ""
    : "";

  const updateSelectedText = (value) => {
    if (!editingSelection || !canvas) return;
    if (selKind === "arc") {
      rebuildArc(canvas, selected, { text: value });
    } else {
      const r = isRTL(value);
      selected.set({ text: value, direction: r ? "rtl" : "ltr", ...(r ? { charSpacing: 0 } : {}) });
      selected.setCoords();
      canvas.requestRenderAll();
    }
    touch();
  };

  const [text, setText] = useState("APPROVED");
  const [weight, setWeight] = useState("700");

  const rtl = isRTL(text);
  const font = fontForScript(text);

  const add = async () => {
    await loadFont(font);
    addObject(
      createSpecObject({
        type: "text",
        text: text || "TEXT",
        fontSize: 44,
        fontFamily: font,
        fontWeight: weight,
        charSpacing: isRTL(text) ? 0 : 60,
        fill: inkColor,
        cx: CANVAS_SIZE / 2,
        cy: CANVAS_SIZE / 2,
        w: Math.max(220, Math.min(520, (text.length || 6) * 34)),
      })
    );
    toast("Text added — curve it anytime from Properties", "success");
  };

  return (
    <div className="space-y-2.5">
      {editingSelection && (
        <div
          className="border px-2 py-2"
          style={{ borderColor: "var(--border-soft)", background: "var(--bg-sunken)" }}
        >
          <div className="label mb-1.5">
            {selKind === "arc" ? "Selected curve" : "Selected text"}
          </div>
          <textarea
            className="field resize-none"
            aria-label="Edit selected text"
            rows={2}
            dir={isRTL(selText) ? "rtl" : "ltr"}
            style={{ fontFamily: selected?.fontFamily || selected?.stampMeta?.fontFamily || font }}
            value={selText}
            onChange={(e) => updateSelectedText(e.target.value)}
            onBlur={() => commit()}
          />
        </div>
      )}

      <Row label="Content" hint={rtl ? "RTL" : "LTR"}>
        <div className="border" style={{ borderColor: "var(--border-soft)", background: "var(--bg-sunken)" }}>
          <textarea
            className="field resize-none border-0"
            aria-label="Text content"
            rows={2}
            dir={rtl ? "rtl" : "ltr"}
            style={{
              fontFamily: font,
              fontWeight: weight,
              fontSize: 13,
              textAlign: rtl ? "right" : "left",
              background: "transparent",
            }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type stamp text…"
          />
          <div
            className="grid grid-cols-4 gap-px border-t"
            style={{ borderColor: "var(--border-soft)", background: "var(--border-soft)" }}
            role="group"
            aria-label="Font weight"
          >
            {WEIGHTS.map((w) => (
              <button
                key={w.v}
                type="button"
                aria-pressed={weight === w.v}
                aria-label={w.v === "300" ? "Light" : w.v === "400" ? "Regular" : w.v === "700" ? "Bold" : "Black"}
                title={w.v === "300" ? "Light" : w.v === "400" ? "Regular" : w.v === "700" ? "Bold" : "Black"}
                onClick={() => setWeight(w.v)}
                className={`btn !min-h-7 !rounded-none !border-0 text-[9px] ${
                  weight === w.v ? "btn-on" : ""
                }`}
                style={{ fontWeight: w.v, background: weight === w.v ? undefined : "var(--bg-raised)" }}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>
      </Row>

      <Row label="Quick phrases">
        <div className="flex flex-wrap gap-1">
          {PRESETS.map((ph) => (
            <button
              key={ph}
              type="button"
              onClick={() => setText(ph)}
              className="btn !min-h-6 !px-1.5 text-[9px] font-medium"
            >
              {ph}
            </button>
          ))}
        </div>
      </Row>

      <button type="button" className="btn btn-accent w-full font-semibold" onClick={add}>
        <Plus size={13} aria-hidden /> Add Text
      </button>
      <p className="flex items-start gap-1.5 text-[9px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
        <Type size={10} className="mt-px shrink-0" aria-hidden />
        Straight by default. Curve any layer from Properties or the canvas toolbar.
      </p>
    </div>
  );
}
