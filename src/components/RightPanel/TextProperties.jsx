import { useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ChevronsDown,
  ChevronsUp,
  FlipHorizontal,
  FlipVertical,
  Italic,
  Spline,
  Type,
  Underline,
  Upload,
} from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { rebuildArc, toggleTextCurve } from "../../utils/canvas";
import { DATE_FORMATS, fieldText } from "../../utils/fields";
import { isRTL } from "../../utils/arabic";
import { FONT_SETS, getCustomFonts, importFontFile, loadFont } from "../../utils/fonts";
import { Row, Slider } from "../ui";
import Tooltip from "../Tooltip";
import TransformBlock from "./TransformBlock";

const WEIGHTS = [
  { v: "300", label: "Light 300" },
  { v: "400", label: "Regular 400" },
  { v: "500", label: "Medium 500" },
  { v: "600", label: "SemiBold 600" },
  { v: "700", label: "Bold 700" },
  { v: "800", label: "ExtraBold 800" },
  { v: "900", label: "Black 900" },
];

function IconBtn({ label, on, onClick, children, danger }) {
  return (
    <Tooltip label={label} side="top">
      <button
        type="button"
        className={`btn ${on ? "btn-on" : ""} ${danger ? "btn-danger" : ""}`}
        aria-label={label}
        aria-pressed={on == null ? undefined : !!on}
        onClick={onClick}
      >
        {children}
      </button>
    </Tooltip>
  );
}

export default function TextProperties({ obj, kind }) {
  const canvas = useStampStore((s) => s.canvas);
  const commit = useStampStore((s) => s.commit);
  const touch = useStampStore((s) => s.touchSelection);
  const isArc = kind === "arc";
  const meta = obj.stampMeta || {};
  const rtl = isRTL(isArc ? meta.text : obj.text);

  const update = (patch, { silent } = {}) => {
    if (isArc) {
      rebuildArc(canvas, obj, patch);
    } else {
      const next = { ...patch };
      if (next.text !== undefined) {
        const r = isRTL(next.text);
        next.direction = r ? "rtl" : "ltr";
        if (r) next.charSpacing = 0;
      }
      obj.set(next);
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

  const toast = useStampStore((s) => s.toast);
  const fontFileRef = useRef(null);
  const [custom, setCustom] = useState(getCustomFonts());

  const onImportFont = async (files) => {
    const file = files?.[0];
    if (!file) return;
    try {
      const fam = await importFontFile(file);
      setCustom(getCustomFonts());
      update({ fontFamily: fam });
      toast(`Font "${fam}" imported and applied`, "success");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const val = (key, fallback) => (isArc ? meta[key] ?? fallback : obj[key] ?? fallback);
  const family = val("fontFamily", "Oswald");
  const weight = String(val("fontWeight", "400"));
  const currentText = isArc ? meta.text || "" : obj.text || "";

  const applyCase = (mode) => {
    const src = currentText;
    const next =
      mode === "upper"
        ? src.toUpperCase()
        : mode === "lower"
          ? src.toLowerCase()
          : src.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    update({ text: next });
  };

  const setShape = (v) => {
    if (v === "straight") {
      if (!isArc) return;
      toggleTextCurve(canvas, obj);
    } else if (v === "curved") {
      if (isArc) return;
      toggleTextCurve(canvas, obj, { position: "top" });
    } else if (isArc) {
      if ((meta.position || "top") === v) return;
      update({ position: v });
      return;
    } else {
      toggleTextCurve(canvas, obj, { position: v });
    }
    commit();
    touch();
    useStampStore.getState().syncSelection();
  };

  return (
    <div className="space-y-3">
      {!meta.field && !isArc && (
        <Row label="Live field">
          <div className="grid grid-cols-2 gap-1">
            {["date", "time", "serial", "datetime"].map((id) => (
              <button
                key={id}
                type="button"
                className="btn text-[10px]"
                onClick={() => {
                  const next = {
                    ...(obj.stampMeta || {}),
                    kind: "text",
                    field: id,
                    dateFormat: "DD MMM YYYY",
                    serialPrefix: "NO. ",
                    serialValue: 1,
                    serialPad: 4,
                  };
                  obj.stampMeta = next;
                  update({ text: fieldText(next) });
                }}
              >
                {id}
              </button>
            ))}
          </div>
        </Row>
      )}

      {meta.field && (
        <Row label="Live field" hint={meta.field}>
          <div className="grid grid-cols-2 gap-1 mb-1.5">
            {["date", "time", "datetime", "serial"].map((id) => (
              <button
                key={id}
                type="button"
                className={`btn text-[10px] ${meta.field === id ? "btn-on" : ""}`}
                onClick={() => {
                  const next = { ...meta, field: id };
                  if (id === "serial") {
                    next.serialPrefix = next.serialPrefix ?? "NO. ";
                    next.serialValue = next.serialValue ?? 1;
                    next.serialPad = next.serialPad ?? 4;
                  }
                  obj.stampMeta = next;
                  update({ text: fieldText(next) });
                }}
              >
                {id}
              </button>
            ))}
          </div>
          {(meta.field === "date" || meta.field === "datetime") && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {DATE_FORMATS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`btn !min-h-6 !px-1.5 text-[9px] ${meta.dateFormat === f.id ? "btn-on" : ""}`}
                  onClick={() => {
                    const next = { ...meta, dateFormat: f.id };
                    obj.stampMeta = next;
                    update({ text: fieldText(next) });
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
          {meta.field === "serial" && (
            <div className="grid grid-cols-3 gap-1">
              <input
                className="field"
                aria-label="Serial prefix"
                value={meta.serialPrefix ?? "NO. "}
                onChange={(e) => {
                  const next = { ...meta, serialPrefix: e.target.value };
                  obj.stampMeta = next;
                  update({ text: fieldText(next) }, { silent: true });
                }}
                onBlur={() => commit()}
              />
              <input
                className="field"
                type="number"
                aria-label="Serial value"
                value={meta.serialValue ?? 1}
                onChange={(e) => {
                  const next = { ...meta, serialValue: Number(e.target.value) || 1 };
                  obj.stampMeta = next;
                  update({ text: fieldText(next) }, { silent: true });
                }}
                onBlur={() => commit()}
              />
              <input
                className="field"
                type="number"
                aria-label="Serial digits"
                value={meta.serialPad ?? 4}
                min={1}
                max={8}
                onChange={(e) => {
                  const next = { ...meta, serialPad: Number(e.target.value) || 4 };
                  obj.stampMeta = next;
                  update({ text: fieldText(next) }, { silent: true });
                }}
                onBlur={() => commit()}
              />
            </div>
          )}
        </Row>
      )}

      <Row label="Content">
        <textarea
          className="field resize-none"
          rows={2}
          aria-label="Selected text content"
          dir={rtl ? "rtl" : "ltr"}
          style={{ fontFamily: family, fontWeight: weight, fontSize: 12, lineHeight: 1.4 }}
          value={currentText}
          onChange={(e) => update({ text: e.target.value }, { silent: true })}
          onBlur={() => commit()}
        />
        <div className="icon-grid mt-1.5">
          <IconBtn label="Uppercase" onClick={() => applyCase("upper")}>
            <span className="text-[10px] font-semibold">AA</span>
          </IconBtn>
          <IconBtn label="Title case" onClick={() => applyCase("title")}>
            <span className="text-[10px] font-semibold">Aa</span>
          </IconBtn>
          <IconBtn label="Lowercase" onClick={() => applyCase("lower")}>
            <span className="text-[10px] font-semibold">aa</span>
          </IconBtn>
        </div>
      </Row>

      <Row label="Text shape">
        <div className="icon-grid">
          <IconBtn label="Straight text" on={!isArc} onClick={() => setShape("straight")}>
            <Type size={15} />
          </IconBtn>
          <IconBtn label="Curved text" on={isArc} onClick={() => setShape("curved")}>
            <Spline size={15} />
          </IconBtn>
          <IconBtn
            label="Top arch"
            on={isArc && (meta.position || "top") === "top"}
            onClick={() => setShape("top")}
          >
            <ChevronsUp size={15} />
          </IconBtn>
          <IconBtn
            label="Bottom arch"
            on={isArc && (meta.position || "top") === "bottom"}
            onClick={() => setShape("bottom")}
          >
            <ChevronsDown size={15} />
          </IconBtn>
        </div>
      </Row>

      <Row label="Flip">
        <div className="icon-grid">
          <IconBtn
            label="Flip horizontal"
            on={!!obj.flipX}
            onClick={() => {
              obj.set({ flipX: !obj.flipX });
              obj.setCoords();
              canvas.requestRenderAll();
              commit();
              touch();
            }}
          >
            <FlipHorizontal size={15} />
          </IconBtn>
          <IconBtn
            label="Flip vertical"
            on={!!obj.flipY}
            onClick={() => {
              obj.set({ flipY: !obj.flipY });
              obj.setCoords();
              canvas.requestRenderAll();
              commit();
              touch();
            }}
          >
            <FlipVertical size={15} />
          </IconBtn>
          {!isArc && (
            <>
              <IconBtn
                label="Italic"
                on={obj.fontStyle === "italic"}
                onClick={() =>
                  update({ fontStyle: obj.fontStyle === "italic" ? "normal" : "italic" })
                }
              >
                <Italic size={15} />
              </IconBtn>
              <IconBtn
                label="Underline"
                on={!!obj.underline}
                onClick={() => update({ underline: !obj.underline })}
              >
                <Underline size={15} />
              </IconBtn>
            </>
          )}
        </div>
      </Row>

      {!isArc && (
        <Row label="Alignment">
          <div className="icon-grid">
            <IconBtn
              label="Align left"
              on={obj.textAlign === "left"}
              onClick={() => update({ textAlign: "left" })}
            >
              <AlignLeft size={15} />
            </IconBtn>
            <IconBtn
              label="Align center"
              on={obj.textAlign === "center"}
              onClick={() => update({ textAlign: "center" })}
            >
              <AlignCenter size={15} />
            </IconBtn>
            <IconBtn
              label="Align right"
              on={obj.textAlign === "right"}
              onClick={() => update({ textAlign: "right" })}
            >
              <AlignRight size={15} />
            </IconBtn>
          </div>
        </Row>
      )}

      <div className="pair-row">
        <div>
          <span className="label mb-1 block">Typeface</span>
          <div className="flex gap-1.5">
            <select
              className="field"
              aria-label="Font family"
              value={family}
              onChange={(e) => setFont(e.target.value)}
              style={{ fontFamily: family }}
            >
              {custom.length > 0 && (
                <optgroup label="My Uploaded Fonts">
                  {custom.map((f) => (
                    <option key={f} value={f} style={{ fontFamily: f }}>
                      {f}
                    </option>
                  ))}
                </optgroup>
              )}
              {FONT_SETS.map((g) => (
                <optgroup key={g.script} label={g.script}>
                  {g.fonts.map((f) => (
                    <option key={f} value={f} style={{ fontFamily: f }}>
                      {f}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <Tooltip label="Upload font" hint="TTF / OTF / WOFF" side="top">
              <button
                type="button"
                className="btn btn-icon shrink-0"
                aria-label="Import font file"
                onClick={() => fontFileRef.current?.click()}
              >
                <Upload size={15} />
              </button>
            </Tooltip>
          </div>
          <input
            ref={fontFileRef}
            type="file"
            accept=".ttf,.otf,.woff,.woff2,font/*"
            className="hidden"
            onChange={(e) => {
              onImportFont(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
        <div>
          <span className="label mb-1 block">Weight</span>
          <select
            className="field"
            aria-label="Font weight"
            value={weight}
            onChange={(e) => update({ fontWeight: e.target.value })}
            style={{ fontFamily: family, fontWeight: weight }}
          >
            {WEIGHTS.map((w) => (
              <option key={w.v} value={w.v}>
                {w.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Slider
        label="Size"
        value={val("fontSize", 36)}
        min={6}
        max={160}
        onChange={(v) => update({ fontSize: v })}
        suffix="px"
      />
      {!isArc && (
        <Slider
          label="Height"
          value={Math.round((obj.scaleY ?? 1) * 100)}
          min={50}
          max={250}
          step={5}
          onChange={(v) => update({ scaleY: v / 100 })}
          suffix="%"
        />
      )}

      {isArc ? (
        <>
          <Slider
            label="Radius"
            value={meta.radius ?? 200}
            min={50}
            max={300}
            onChange={(v) => update({ radius: v })}
            suffix="px"
          />
          <Slider
            label="Spread"
            value={meta.letterSpacing ?? 2}
            min={-5}
            max={30}
            step={0.5}
            onChange={(v) => update({ letterSpacing: v })}
          />
          <Slider
            label="Rotate"
            value={Math.round(obj.angle ?? 0)}
            min={-45}
            max={45}
            onChange={(v) => {
              obj.set({ angle: v });
              obj.setCoords();
              canvas.requestRenderAll();
              commit();
              touch();
            }}
            suffix="°"
          />
          <Tooltip label="Balance arc ends" side="top">
            <button
              type="button"
              className="btn w-full"
              aria-label="Balance arc ends"
              onClick={() => {
                const t = String(meta.text || "").trim().replace(/\s+/g, " ");
                obj.set({ angle: 0 });
                update({ text: t });
              }}
            >
              Balance arc ends
            </button>
          </Tooltip>
        </>
      ) : (
        <>
          {!rtl && (
            <Slider
              label="Track"
              value={obj.charSpacing ?? 0}
              min={-100}
              max={800}
              step={10}
              onChange={(v) => update({ charSpacing: v })}
            />
          )}
          <Slider
            label="Leading"
            value={obj.lineHeight ?? 1.16}
            min={0.6}
            max={2.5}
            step={0.02}
            onChange={(v) => update({ lineHeight: v })}
          />
        </>
      )}

      <div className="border-t pt-3" style={{ borderColor: "var(--border-soft)" }}>
        <TransformBlock obj={obj} />
      </div>
    </div>
  );
}
