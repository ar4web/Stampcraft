import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Underline,
} from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { rebuildArc } from "../../utils/canvas";
import { FONT_SETS, loadFont } from "../../utils/fonts";
import { ColorField, Row, SegButton, Slider } from "../ui";

export default function TextProperties({ obj, kind }) {
  const canvas = useStampStore((s) => s.canvas);
  const commit = useStampStore((s) => s.commit);
  const touch = useStampStore((s) => s.touchSelection);
  const isArc = kind === "arc";
  const meta = obj.stampMeta || {};

  const update = (patch, { silent } = {}) => {
    if (isArc) {
      rebuildArc(canvas, obj, patch);
    } else {
      obj.set(patch);
      obj.setCoords();
      canvas.requestRenderAll();
    }
    if (!silent) commit();
    touch();
  };

  const setFont = async (family) => {
    await loadFont(family);
    update({ fontFamily: family });
  };

  const value = (key, fallback) => (isArc ? meta[key] ?? fallback : obj[key] ?? fallback);

  return (
    <div>
      <Row label={isArc ? "Arc text" : "Text content"}>
        {isArc ? (
          <input
            className="field"
            value={meta.text || ""}
            onChange={(e) => update({ text: e.target.value }, { silent: true })}
            onBlur={() => commit()}
          />
        ) : (
          <textarea
            className="field resize-none"
            rows={3}
            value={obj.text || ""}
            onChange={(e) => update({ text: e.target.value }, { silent: true })}
            onBlur={() => commit()}
          />
        )}
      </Row>

      <Row label="Font family">
        <select
          className="field"
          value={value("fontFamily", "Oswald")}
          onChange={(e) => setFont(e.target.value)}
          style={{ fontFamily: value("fontFamily", "Oswald") }}
        >
          {FONT_SETS.map((g) => (
            <optgroup key={g.script} label={g.script}>
              {g.fonts.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </Row>

      <Slider
        label="Font size"
        value={value("fontSize", 36)}
        min={6}
        max={160}
        onChange={(v) => update({ fontSize: v })}
        suffix="px"
      />

      <div className="mb-2.5 flex gap-1.5">
        <button
          className="btn flex-1"
          style={
            String(value("fontWeight", "400")) === "700"
              ? { borderColor: "var(--accent)", color: "var(--accent)" }
              : undefined
          }
          onClick={() =>
            update({
              fontWeight: String(value("fontWeight", "400")) === "700" ? "400" : "700",
            })
          }
        >
          <Bold size={14} />
        </button>
        {!isArc && (
          <>
            <button
              className="btn flex-1"
              style={obj.fontStyle === "italic" ? { borderColor: "var(--accent)", color: "var(--accent)" } : undefined}
              onClick={() => update({ fontStyle: obj.fontStyle === "italic" ? "normal" : "italic" })}
            >
              <Italic size={14} />
            </button>
            <button
              className="btn flex-1"
              style={obj.underline ? { borderColor: "var(--accent)", color: "var(--accent)" } : undefined}
              onClick={() => update({ underline: !obj.underline })}
            >
              <Underline size={14} />
            </button>
          </>
        )}
      </div>

      {isArc ? (
        <>
          <Slider
            label="Arc radius"
            value={meta.radius ?? 200}
            min={50}
            max={300}
            onChange={(v) => update({ radius: v })}
            suffix="px"
          />
          <Slider
            label="Letter spacing"
            value={meta.letterSpacing ?? 2}
            min={-5}
            max={30}
            step={0.5}
            onChange={(v) => update({ letterSpacing: v })}
          />
          <SegButton
            value={meta.position || "top"}
            onChange={(v) => update({ position: v })}
            options={[
              { value: "top", label: "Top arc" },
              { value: "bottom", label: "Bottom arc" },
            ]}
          />
        </>
      ) : (
        <>
          <Slider
            label="Letter spacing"
            value={obj.charSpacing ?? 0}
            min={-100}
            max={800}
            step={10}
            onChange={(v) => update({ charSpacing: v })}
          />
          <Slider
            label="Line height"
            value={obj.lineHeight ?? 1.16}
            min={0.6}
            max={2.5}
            step={0.02}
            onChange={(v) => update({ lineHeight: v })}
          />
          <Row label="Alignment">
            <div className="flex gap-1.5">
              {[
                { v: "left", I: AlignLeft },
                { v: "center", I: AlignCenter },
                { v: "right", I: AlignRight },
              ].map(({ v, I }) => (
                <button
                  key={v}
                  className="btn flex-1"
                  style={obj.textAlign === v ? { borderColor: "var(--accent)", color: "var(--accent)" } : undefined}
                  onClick={() => update({ textAlign: v })}
                >
                  <I size={14} />
                </button>
              ))}
            </div>
          </Row>
        </>
      )}

      <ColorField
        label="Ink colour"
        value={value("fill", "#000000")}
        onChange={(v) => update({ fill: v })}
      />
    </div>
  );
}
