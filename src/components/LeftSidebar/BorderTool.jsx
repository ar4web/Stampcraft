import { useState } from "react";
import useStampStore from "../../store/useStampStore";
import { CANVAS_SIZE, createSpecObject } from "../../utils/canvas";
import { addObject } from "../../utils/actions";
import { Row, Slider } from "../ui";

const C = CANVAS_SIZE / 2;

export default function BorderTool() {
  const ink = useStampStore((s) => s.inkColor);
  const toast = useStampStore((s) => s.toast);
  const [sw, setSw] = useState(6);

  const drop = (specs, label) => {
    specs.forEach((s, i) => addObject(createSpecObject(s), { select: i === 0 }));
    toast(`Added ${label}`, "success");
  };

  const frames = [
    {
      id: "double",
      label: "Double ring",
      build: () => [
        { type: "circle", r: 250, cx: C, cy: C, stroke: ink, strokeWidth: sw + 2, name: "Outer ring" },
        { type: "circle", r: 228, cx: C, cy: C, stroke: ink, strokeWidth: Math.max(1, sw - 2), name: "Inner ring" },
      ],
    },
    {
      id: "triple",
      label: "Triple ring",
      build: () => [
        { type: "circle", r: 250, cx: C, cy: C, stroke: ink, strokeWidth: sw + 1, name: "Outer ring" },
        { type: "circle", r: 234, cx: C, cy: C, stroke: ink, strokeWidth: 1.5, name: "Mid ring" },
        { type: "circle", r: 218, cx: C, cy: C, stroke: ink, strokeWidth: Math.max(1, sw - 2), name: "Inner ring" },
      ],
    },
    {
      id: "dashed",
      label: "Dashed ring",
      build: () => [
        {
          type: "circle",
          r: 246,
          cx: C,
          cy: C,
          stroke: ink,
          strokeWidth: sw,
          strokeDashArray: [10, 8],
          name: "Dashed ring",
        },
      ],
    },
    {
      id: "rect",
      label: "Rect frame",
      build: () => [
        { type: "rect", w: 500, h: 250, rx: 4, cx: C, cy: C, stroke: ink, strokeWidth: sw + 2, name: "Outer frame" },
        { type: "rect", w: 472, h: 222, rx: 2, cx: C, cy: C, stroke: ink, strokeWidth: 1.5, name: "Inner frame" },
      ],
    },
    {
      id: "ticket",
      label: "Ticket",
      build: () => [
        { type: "rect", w: 490, h: 240, rx: 14, cx: C, cy: C, stroke: ink, strokeWidth: sw + 2, name: "Ticket outer" },
        { type: "rect", w: 458, h: 208, rx: 8, cx: C, cy: C, stroke: ink, strokeWidth: 1.5, name: "Ticket inner" },
      ],
    },
    {
      id: "oval",
      label: "Oval frame",
      build: () => [
        { type: "ellipse", rx: 250, ry: 170, cx: C, cy: C, stroke: ink, strokeWidth: sw + 2, name: "Oval outer" },
        { type: "ellipse", rx: 228, ry: 148, cx: C, cy: C, stroke: ink, strokeWidth: 2, name: "Oval inner" },
      ],
    },
    {
      id: "hex",
      label: "Hex frame",
      build: () => [
        { type: "hexagon", r: 248, cx: C, cy: C, stroke: ink, strokeWidth: sw + 1, name: "Hex outer" },
        { type: "hexagon", r: 226, cx: C, cy: C, stroke: ink, strokeWidth: 2, name: "Hex inner" },
      ],
    },
    {
      id: "rules",
      label: "Rule lines",
      build: () => [
        { type: "line", x1: C - 220, y1: C - 70, x2: C + 220, y2: C - 70, stroke: ink, strokeWidth: sw, name: "Rule top" },
        { type: "line", x1: C - 220, y1: C + 70, x2: C + 220, y2: C + 70, stroke: ink, strokeWidth: sw, name: "Rule bottom" },
      ],
    },
  ];

  return (
    <div className="space-y-2.5">
      <Slider label="Stroke" value={sw} min={1} max={16} onChange={setSw} suffix="px" />
      <Row label="Frames">
        <div className="grid grid-cols-2 gap-1.5">
          {frames.map((f) => (
            <button key={f.id} type="button" className="btn text-[10px]" onClick={() => drop(f.build(), f.label)}>
              {f.label}
            </button>
          ))}
        </div>
      </Row>
      <p className="text-[9px] leading-relaxed" style={{ color: "var(--text-mute)" }}>
        Nested rings and frames in current ink. Each ring stays a separate layer.
      </p>
    </div>
  );
}
