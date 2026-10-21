import { useState } from "react";
import { Plus } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { CANVAS_SIZE, createSpecObject } from "../../utils/canvas";
import { addObject } from "../../utils/actions";
import { fontForScript, loadFont } from "../../utils/fonts";
import { Row } from "../ui";

const C = CANVAS_SIZE / 2;

const MARKS = [
  "APPROVED",
  "PAID",
  "COPY",
  "VOID",
  "RECEIVED",
  "ORIGINAL",
  "CONFIDENTIAL",
  "DRAFT",
  "URGENT",
  "FILED",
  "VERIFIED",
  "SAMPLE",
];

export default function MarkTool() {
  const ink = useStampStore((s) => s.inkColor);
  const toast = useStampStore((s) => s.toast);
  const [custom, setCustom] = useState("");

  const drop = async (text, angle = -18) => {
    const value = (text || "").trim().toUpperCase();
    if (!value) {
      toast("Type a word first", "info");
      return;
    }
    const font = fontForScript(value);
    await loadFont(font);
    addObject(
      createSpecObject({
        type: "text",
        text: value,
        fontSize: Math.max(28, Math.min(64, Math.round(420 / Math.max(4, value.length)))),
        fontFamily: font,
        fontWeight: "900",
        fill: ink,
        charSpacing: 40,
        cx: C,
        cy: C,
        w: Math.max(260, Math.min(520, value.length * 42)),
        angle,
        name: `Mark: ${value.slice(0, 14)}`,
      })
    );
    toast(`Added ${value}`, "success");
  };

  return (
    <div className="space-y-2.5">
      <Row label="Office marks">
        <div className="grid grid-cols-2 gap-1.5">
          {MARKS.map((m) => (
            <button key={m} type="button" className="btn !px-1 text-[9px] font-semibold tracking-wide" onClick={() => drop(m)}>
              {m}
            </button>
          ))}
        </div>
      </Row>
      <Row label="Custom mark">
        <div className="flex gap-1">
          <input
            className="field flex-1"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="YOUR WORD"
            aria-label="Custom mark text"
            onKeyDown={(e) => {
              if (e.key === "Enter") drop(custom);
            }}
          />
          <button type="button" className="btn btn-accent !px-2" onClick={() => drop(custom)} aria-label="Add custom mark">
            <Plus size={13} />
          </button>
        </div>
      </Row>
      <p className="text-[9px] leading-relaxed" style={{ color: "var(--text-mute)" }}>
        Bold, slightly rotated office words. Straighten or recolor in Properties.
      </p>
    </div>
  );
}
