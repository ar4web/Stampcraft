import { useState } from "react";
import { Plus, Type, Spline } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { CANVAS_SIZE, createSpecObject, makeArcText } from "../../utils/canvas";
import { addObject } from "../../utils/actions";
import { FONT_SETS, loadFont } from "../../utils/fonts";
import { ColorField, Row, SegButton, Slider } from "../ui";

export default function TextTool() {
  const inkColor = useStampStore((s) => s.inkColor);
  const setInkColor = useStampStore((s) => s.setInkColor);
  const toast = useStampStore((s) => s.toast);

  const [mode, setMode] = useState("straight");
  const [text, setText] = useState("APPROVED");
  const [arcText, setArcText] = useState("COMPANY NAME");
  const [font, setFont] = useState("Oswald");
  const [weight, setWeight] = useState("700");
  const [size, setSize] = useState(44);
  const [spacing, setSpacing] = useState(60);
  const [radius, setRadius] = useState(200);
  const [arcPos, setArcPos] = useState("top");
  const [busy, setBusy] = useState(false);

  const chooseFont = async (family) => {
    setFont(family);
    setBusy(true);
    const ok = await loadFont(family);
    setBusy(false);
    if (!ok) toast(`Could not load font ${family}`, "error");
  };

  const addStraight = async () => {
    await loadFont(font);
    addObject(
      createSpecObject({
        type: "text",
        text: text || "TEXT",
        fontSize: size,
        fontFamily: font,
        fontWeight: weight,
        charSpacing: spacing,
        fill: inkColor,
        cx: CANVAS_SIZE / 2,
        cy: CANVAS_SIZE / 2,
        w: Math.max(200, Math.min(520, (text.length || 6) * size * 0.75)),
      })
    );
  };

  const addArc = async () => {
    await loadFont(font);
    const obj = makeArcText({
      text: arcText || "ARC TEXT",
      radius,
      fontSize: size,
      fontFamily: font,
      fontWeight: weight,
      fill: inkColor,
      letterSpacing: spacing / 25,
      position: arcPos,
    });
    addObject(obj);
  };

  return (
    <div>
      <SegButton
        value={mode}
        onChange={setMode}
        options={[
          { value: "straight", label: "Straight", icon: <span className="flex items-center justify-center gap-1"><Type size={12} /> Straight</span> },
          { value: "arc", label: "Arc", icon: <span className="flex items-center justify-center gap-1"><Spline size={12} /> Arc</span> },
        ]}
      />

      {mode === "straight" ? (
        <Row label="Text (multi-line)">
          <textarea
            className="field resize-none"
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </Row>
      ) : (
        <Row label="Arc text">
          <input className="field" value={arcText} onChange={(e) => setArcText(e.target.value)} />
        </Row>
      )}

      <Row label={`Font family${busy ? " (loading…)" : ""}`}>
        <select
          className="field"
          value={font}
          onChange={(e) => chooseFont(e.target.value)}
          style={{ fontFamily: font }}
        >
          {FONT_SETS.map((group) => (
            <optgroup key={group.script} label={group.script}>
              {group.fonts.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </Row>

      <SegButton
        value={weight}
        onChange={setWeight}
        options={[
          { value: "400", label: "Regular" },
          { value: "700", label: "Bold" },
        ]}
      />

      <Slider label="Font size" value={size} min={8} max={140} onChange={setSize} suffix="px" />
      <Slider
        label={mode === "arc" ? "Letter spread" : "Letter spacing"}
        value={spacing}
        min={0}
        max={600}
        step={5}
        onChange={setSpacing}
      />
      {mode === "arc" && (
        <>
          <Slider label="Arc radius" value={radius} min={60} max={290} onChange={setRadius} suffix="px" />
          <SegButton
            value={arcPos}
            onChange={setArcPos}
            options={[
              { value: "top", label: "Top arc" },
              { value: "bottom", label: "Bottom arc" },
            ]}
          />
        </>
      )}

      <ColorField value={inkColor} onChange={setInkColor} />

      <button className="btn btn-accent w-full" onClick={mode === "arc" ? addArc : addStraight}>
        <Plus size={14} /> Add {mode === "arc" ? "arc text" : "text"}
      </button>
    </div>
  );
}
