import {
  Asterisk,
  Circle,
  Diamond,
  Minus,
  Sparkle,
  Star,
  Wand2,
} from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { CANVAS_SIZE, createSpecObject } from "../../utils/canvas";
import { addObject } from "../../utils/actions";
import { Row } from "../ui";

const C = CANVAS_SIZE / 2;

function place(specs, label) {
  const toast = useStampStore.getState().toast;
  specs.forEach((s, i) => addObject(createSpecObject(s), { select: i === 0 }));
  toast(`Added ${label}`, "success");
}

export default function OrnamentTool() {
  const ink = useStampStore((s) => s.inkColor);

  const items = [
    {
      id: "star",
      label: "Star",
      icon: Star,
      run: () =>
        place(
          [{ type: "star", outer: 28, inner: 12, points: 5, cx: C, cy: C, fill: ink, strokeWidth: 0, name: "Star" }],
          "star"
        ),
    },
    {
      id: "burst",
      label: "Burst",
      icon: Asterisk,
      run: () =>
        place(
          [{ type: "star", outer: 32, inner: 10, points: 8, cx: C, cy: C, fill: ink, strokeWidth: 0, name: "Burst" }],
          "burst"
        ),
    },
    {
      id: "dot",
      label: "Dot",
      icon: Circle,
      run: () =>
        place([{ type: "circle", r: 8, cx: C, cy: C, fill: ink, strokeWidth: 0, name: "Dot" }], "dot"),
    },
    {
      id: "ring",
      label: "Ring",
      icon: Circle,
      run: () =>
        place([{ type: "circle", r: 16, cx: C, cy: C, stroke: ink, strokeWidth: 2.5, name: "Ring" }], "ring"),
    },
    {
      id: "rule",
      label: "Rule",
      icon: Minus,
      run: () =>
        place(
          [{ type: "line", x1: C - 90, y1: C, x2: C + 90, y2: C, stroke: ink, strokeWidth: 2.5, name: "Rule" }],
          "rule"
        ),
    },
    {
      id: "dblrule",
      label: "Double",
      icon: Minus,
      run: () =>
        place(
          [
            { type: "line", x1: C - 90, y1: C - 4, x2: C + 90, y2: C - 4, stroke: ink, strokeWidth: 1.5, name: "Rule top" },
            { type: "line", x1: C - 90, y1: C + 4, x2: C + 90, y2: C + 4, stroke: ink, strokeWidth: 1.5, name: "Rule bottom" },
          ],
          "double rule"
        ),
    },
    {
      id: "diamond",
      label: "Diamond",
      icon: Diamond,
      run: () =>
        place(
          [
            {
              type: "polygon",
              pts: [
                { x: 0, y: -16 },
                { x: 12, y: 0 },
                { x: 0, y: 16 },
                { x: -12, y: 0 },
              ],
              cx: C,
              cy: C,
              fill: ink,
              strokeWidth: 0,
              name: "Diamond",
            },
          ],
          "diamond"
        ),
    },
    {
      id: "laurel",
      label: "Laurel",
      icon: Sparkle,
      run: () =>
        place(
          [
            {
              type: "path",
              d: "M 0 40 C -18 22 -22 -8 -8 -28 C -2 -8 -6 12 0 28 C 6 12 2 -8 8 -28 C 22 -8 18 22 0 40 Z",
              cx: C,
              cy: C,
              fill: ink,
              strokeWidth: 0,
              name: "Laurel",
            },
          ],
          "laurel"
        ),
    },
    {
      id: "flourish",
      label: "Flourish",
      icon: Wand2,
      run: () =>
        place(
          [
            {
              type: "path",
              d: "M -70 0 C -40 -28 -10 -8 0 0 C 10 8 40 28 70 0 M -48 0 C -28 16 -8 6 0 0 C 8 -6 28 -16 48 0",
              cx: C,
              cy: C,
              fill: "transparent",
              stroke: ink,
              strokeWidth: 2,
              name: "Flourish",
            },
          ],
          "flourish"
        ),
    },
    {
      id: "starline",
      label: "Star line",
      icon: Star,
      run: () =>
        place(
          [
            { type: "line", x1: C - 110, y1: C, x2: C - 18, y2: C, stroke: ink, strokeWidth: 2.5, name: "Divider L" },
            { type: "star", outer: 12, inner: 5, points: 5, cx: C, cy: C, fill: ink, strokeWidth: 0, name: "Divider star" },
            { type: "line", x1: C + 18, y1: C, x2: C + 110, y2: C, stroke: ink, strokeWidth: 2.5, name: "Divider R" },
          ],
          "star divider"
        ),
    },
    {
      id: "dots3",
      label: "Dots",
      icon: Circle,
      run: () =>
        place(
          [
            { type: "circle", r: 4, cx: C - 16, cy: C, fill: ink, strokeWidth: 0, name: "Dot L" },
            { type: "circle", r: 4, cx: C, cy: C, fill: ink, strokeWidth: 0, name: "Dot C" },
            { type: "circle", r: 4, cx: C + 16, cy: C, fill: ink, strokeWidth: 0, name: "Dot R" },
          ],
          "dot divider"
        ),
    },
    {
      id: "seal",
      label: "Rosette",
      icon: Asterisk,
      run: () =>
        place(
          [
            { type: "star", outer: 36, inner: 22, points: 12, cx: C, cy: C, fill: ink, strokeWidth: 0, name: "Rosette" },
            { type: "circle", r: 10, cx: C, cy: C, fill: "transparent", stroke: ink, strokeWidth: 2, name: "Rosette core" },
          ],
          "rosette"
        ),
    },
  ];

  return (
    <div className="space-y-2.5">
      <Row label="Ornaments">
        <div className="grid grid-cols-3 gap-1.5">
          {items.map((it) => (
            <button
              key={it.id}
              type="button"
              onClick={it.run}
              className="btn flex-col !gap-1 !px-0"
              style={{ minHeight: 52 }}
              aria-label={`Add ${it.label}`}
            >
              <it.icon size={14} />
              <span className="text-[9px] font-medium" style={{ color: "var(--text-dim)" }}>
                {it.label}
              </span>
            </button>
          ))}
        </div>
      </Row>
      <p className="text-[9px] leading-relaxed" style={{ color: "var(--text-mute)" }}>
        Drops at the paper centre in current ink. Move and scale like any layer.
      </p>
    </div>
  );
}
