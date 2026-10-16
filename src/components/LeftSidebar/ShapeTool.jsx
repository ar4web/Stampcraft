import { useState } from "react";
import { Circle, Square, Hexagon, Star, Minus, Egg, Triangle } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { CANVAS_SIZE, buildShapeWithDoubleBorder, createSpecObject } from "../../utils/canvas";
import { addObject } from "../../utils/actions";
import { ColorField, Row, Slider, Toggle } from "../ui";

const C = CANVAS_SIZE / 2;

const SHAPES = [
  { id: "circle", label: "Circle", icon: Circle, spec: { type: "circle", r: 240 } },
  { id: "ellipse", label: "Oval", icon: Egg, spec: { type: "ellipse", rx: 255, ry: 160 } },
  { id: "rect", label: "Rect", icon: Square, spec: { type: "rect", w: 460, h: 230, rx: 0 } },
  { id: "round", label: "Rounded", icon: Square, spec: { type: "rect", w: 460, h: 230, rx: 26 } },
  { id: "hexagon", label: "Hexagon", icon: Hexagon, spec: { type: "hexagon", r: 240 } },
  { id: "star", label: "Star", icon: Star, spec: { type: "star", outer: 240, inner: 100 } },
  { id: "triangle", label: "Triangle", icon: Triangle, spec: { type: "triangle", r: 230 } },
  { id: "line", label: "Line", icon: Minus, spec: { type: "line", x1: C - 170, y1: C, x2: C + 170, y2: C } },
];

const FRAMES = [
  {
    id: "doublering",
    label: "Double ring",
    build: (ink, sw) => [
      { type: "circle", r: 250, cx: C, cy: C, stroke: ink, strokeWidth: sw + 3 },
      { type: "circle", r: 226, cx: C, cy: C, stroke: ink, strokeWidth: Math.max(1, sw - 2) },
    ],
  },
  {
    id: "ringdots",
    label: "Ring + stars",
    build: (ink, sw) => [
      { type: "circle", r: 248, cx: C, cy: C, stroke: ink, strokeWidth: sw },
      { type: "star", outer: 20, inner: 8, points: 5, cx: C - 196, cy: C, fill: ink, strokeWidth: 0 },
      { type: "star", outer: 20, inner: 8, points: 5, cx: C + 196, cy: C, fill: ink, strokeWidth: 0 },
    ],
  },
  {
    id: "ticket",
    label: "Ticket frame",
    build: (ink, sw) => [
      { type: "rect", w: 480, h: 240, rx: 14, cx: C, cy: C, stroke: ink, strokeWidth: sw + 4 },
      { type: "rect", w: 448, h: 208, rx: 8, cx: C, cy: C, stroke: ink, strokeWidth: 1.5 },
    ],
  },
  {
    id: "banner",
    label: "Rule lines",
    build: (ink, sw) => [
      { type: "line", x1: C - 220, y1: C - 60, x2: C + 220, y2: C - 60, stroke: ink, strokeWidth: sw },
      { type: "line", x1: C - 220, y1: C + 60, x2: C + 220, y2: C + 60, stroke: ink, strokeWidth: sw },
    ],
  },
];

export default function ShapeTool() {
  const inkColor = useStampStore((s) => s.inkColor);
  const setInkColor = useStampStore((s) => s.setInkColor);
  const [strokeWidth, setStrokeWidth] = useState(6);
  const [scale, setScale] = useState(100);
  const [double, setDouble] = useState(true);
  const [gap, setGap] = useState(8);
  const [filled, setFilled] = useState(false);

  const place = (shape) => {
    const base = { ...shape.spec, cx: C, cy: C, stroke: inkColor, strokeWidth };
    if (filled && shape.id !== "line") base.fill = inkColor;
    const k = scale / 100;
    ["r", "rx", "ry", "outer", "inner", "w", "h"].forEach((key) => {
      if (typeof base[key] === "number" && key !== "rx") base[key] = base[key] * k;
    });
    if (shape.spec.type === "ellipse") base.rx = shape.spec.rx * k;
    const objs = buildShapeWithDoubleBorder(base, double && shape.id !== "line", gap);
    objs.forEach((o, i) => addObject(o, { select: i === 0 }));
  };

  const placeFrame = (frame) => {
    frame.build(inkColor, strokeWidth).forEach((spec, i) => {
      addObject(createSpecObject(spec), { select: i === 0 });
    });
  };

  return (
    <div>
      <Row label="Shapes">
        <div className="grid grid-cols-4 gap-1.5">
          {SHAPES.map((s) => (
            <button
              key={s.id}
              onClick={() => place(s)}
              title={s.label}
              className="btn flex-col !gap-1 !px-1 !py-2"
            >
              <s.icon size={16} />
              <span className="text-[9px]">{s.label}</span>
            </button>
          ))}
        </div>
      </Row>

      <Slider label="Stroke width" value={strokeWidth} min={1} max={20} onChange={setStrokeWidth} suffix="px" />
      <Slider label="Size" value={scale} min={30} max={120} onChange={setScale} suffix="%" />
      <Toggle label="Double border" checked={double} onChange={setDouble} />
      {double && <Slider label="Border gap" value={gap} min={2} max={40} onChange={setGap} suffix="px" />}
      <Toggle label="Solid fill" checked={filled} onChange={setFilled} />
      <ColorField label="Shape colour" value={inkColor} onChange={setInkColor} />

      <Row label="Frame presets">
        <div className="grid grid-cols-2 gap-1.5">
          {FRAMES.map((f) => (
            <button key={f.id} className="btn !py-2 text-[10px]" onClick={() => placeFrame(f)}>
              {f.label}
            </button>
          ))}
        </div>
      </Row>
    </div>
  );
}
