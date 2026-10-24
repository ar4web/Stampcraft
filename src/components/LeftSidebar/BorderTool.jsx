import { useState } from "react";
import { Circle, Egg, Hexagon, Minus, RectangleHorizontal, Square, Star, Triangle } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { CANVAS_SIZE, buildShapeWithDoubleBorder } from "../../utils/canvas";
import { addObject } from "../../utils/actions";
import { Checkbox, Row, Slider } from "../ui";

const C = CANVAS_SIZE / 2;

const SHAPES = [
  { id: "square", label: "Square", icon: Square, spec: { type: "rect", w: 440, h: 440, rx: 0 } },
  { id: "rect", label: "Rect", icon: RectangleHorizontal, spec: { type: "rect", w: 500, h: 250, rx: 0 } },
  { id: "round", label: "Round", icon: RectangleHorizontal, spec: { type: "rect", w: 500, h: 250, rx: 26 } },
  { id: "circle", label: "Circle", icon: Circle, spec: { type: "circle", r: 240 } },
  { id: "ellipse", label: "Oval", icon: Egg, spec: { type: "ellipse", rx: 255, ry: 160 } },
  { id: "hexagon", label: "Hex", icon: Hexagon, spec: { type: "hexagon", r: 240 } },
  { id: "star", label: "Star", icon: Star, spec: { type: "star", outer: 240, inner: 100 } },
  { id: "triangle", label: "Triangle", icon: Triangle, spec: { type: "triangle", r: 230 } },
  { id: "line", label: "Line", icon: Minus, spec: { type: "line", x1: C - 170, y1: C, x2: C + 170, y2: C } },
];

export default function BorderTool() {
  const inkColor = useStampStore((s) => s.inkColor);
  const toast = useStampStore((s) => s.toast);
  const [strokeWidth, setStrokeWidth] = useState(6);
  const [scale, setScale] = useState(100);
  const [double, setDouble] = useState(false);
  const [gap, setGap] = useState(8);
  const [filled, setFilled] = useState(false);
  const [dashed, setDashed] = useState(false);

  const place = (shape) => {
    const base = { ...shape.spec, cx: C, cy: C, stroke: inkColor, strokeWidth, name: shape.label };
    if (filled && shape.id !== "line") base.fill = inkColor;
    if (dashed) base.strokeDashArray = [10, 8];
    const k = scale / 100;
    ["r", "ry", "outer", "inner", "w", "h"].forEach((key) => {
      if (typeof base[key] === "number") base[key] = base[key] * k;
    });
    if (shape.spec.type === "ellipse") base.rx = shape.spec.rx * k;
    const objs = buildShapeWithDoubleBorder(base, double && shape.id !== "line", gap);
    objs.forEach((o, i) => addObject(o, { select: i === 0 }));
    toast(`Added ${shape.label}`, "success");
  };

  return (
    <div>
      <Row label="Frame">
        <div className="grid grid-cols-3 gap-1.5">
          {SHAPES.map((s) => (
            <button
              key={s.id}
              type="button"
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
      <Checkbox label="Double border" checked={double} onChange={setDouble} hint="Adds a nested inner ring when you place a frame." />
      {double && <Slider label="Gap" value={gap} min={2} max={40} onChange={setGap} suffix="px" />}
      <Checkbox label="Solid fill" checked={filled} onChange={setFilled} />
      <Checkbox label="Dashed stroke" checked={dashed} onChange={setDashed} />
      <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-mute)" }}>
        Places a single frame in current ink. Double and fill are optional.
      </p>
    </div>
  );
}
