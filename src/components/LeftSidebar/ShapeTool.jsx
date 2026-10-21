import { useState } from "react";
import { Circle, Egg, Hexagon, Minus, Square, Star, Triangle } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { CANVAS_SIZE, buildShapeWithDoubleBorder } from "../../utils/canvas";
import { addObject } from "../../utils/actions";
import { Checkbox, Row, Slider } from "../ui";

const C = CANVAS_SIZE / 2;

const SHAPES = [
  { id: "circle", label: "Circle", icon: Circle, spec: { type: "circle", r: 240 } },
  { id: "ellipse", label: "Oval", icon: Egg, spec: { type: "ellipse", rx: 255, ry: 160 } },
  { id: "rect", label: "Rect", icon: Square, spec: { type: "rect", w: 460, h: 230, rx: 0 } },
  { id: "round", label: "Round", icon: Square, spec: { type: "rect", w: 460, h: 230, rx: 26 } },
  { id: "hexagon", label: "Hex", icon: Hexagon, spec: { type: "hexagon", r: 240 } },
  { id: "star", label: "Star", icon: Star, spec: { type: "star", outer: 240, inner: 100 } },
  { id: "triangle", label: "Triangle", icon: Triangle, spec: { type: "triangle", r: 230 } },
  { id: "line", label: "Line", icon: Minus, spec: { type: "line", x1: C - 170, y1: C, x2: C + 170, y2: C } },
];

export default function ShapeTool() {
  const inkColor = useStampStore((s) => s.inkColor);
  const [strokeWidth, setStrokeWidth] = useState(6);
  const [scale, setScale] = useState(100);
  const [double, setDouble] = useState(true);
  const [gap, setGap] = useState(8);
  const [filled, setFilled] = useState(false);

  const toast = useStampStore((s) => s.toast);

  const place = (shape) => {
    const base = { ...shape.spec, cx: C, cy: C, stroke: inkColor, strokeWidth };
    if (filled && shape.id !== "line") base.fill = inkColor;
    const k = scale / 100;
    ["r", "ry", "outer", "inner", "w", "h"].forEach((key) => {
      if (typeof base[key] === "number") base[key] = base[key] * k;
    });
    if (shape.spec.type === "ellipse") base.rx = shape.spec.rx * k;
    const objs = buildShapeWithDoubleBorder(base, double && shape.id !== "line", gap);
    objs.forEach((o, i) => addObject(o, { select: i === 0 }));
    toast(`Added ${shape.label} to stamp`, "success");
  };

  return (
    <div>
      <Row label="Shape">
        <div className="grid grid-cols-4 gap-1.5">
          {SHAPES.map((s) => (
            <button
              key={s.id}
              onClick={() => place(s)}
              title={s.label}
              aria-label={`Add ${s.label}`}
              className="btn flex-col !gap-1 !px-0"
              style={{ minHeight: 52 }}
            >
              <s.icon size={16} />
              <span className="text-[11px] font-medium" style={{ color: "var(--text-dim)" }}>
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </Row>

      <Slider label="Stroke" value={strokeWidth} min={1} max={20} onChange={setStrokeWidth} suffix="px" />
      <Slider label="Size" value={scale} min={30} max={120} onChange={setScale} suffix="%" />
      <div className="grid grid-cols-2 gap-x-2">
        <Checkbox label="Double border" checked={double} onChange={setDouble} />
        <Checkbox label="Solid fill" checked={filled} onChange={setFilled} />
      </div>
      {double && <Slider label="Gap" value={gap} min={2} max={40} onChange={setGap} suffix="px" />}

      <p className="text-[9px] leading-relaxed" style={{ color: "var(--text-mute)" }}>
        Uses current ink. Frames live in Borders. Edit strokes in Properties.
      </p>
    </div>
  );
}
