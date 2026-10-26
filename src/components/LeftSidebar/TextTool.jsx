import { useEffect, useState } from "react";
import { Plus, RefreshCw } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { CANVAS_SIZE, createSpecObject, rebuildArc, renderTemplateThumb, selectionKind } from "../../utils/canvas";
import { addObject, applyFieldLook, applyMarkLook, applyStampLook, fieldLookSpecs, markLookSpecs, stampLookSpecs } from "../../utils/actions";
import { FONT_SETS, fontForScript, getCustomFonts, loadFont } from "../../utils/fonts";
import { isRTL } from "../../utils/arabic";
import { DATE_FORMATS } from "../../utils/fields";
import { FIELD_LOOKS, FIELD_STAMPS, MARK_LOOKS, OFFICE_MARKS, STAMP_LOOKS, TEXT_PHRASES } from "../../utils/phrases";
import { Fold, Row } from "../ui";
import FontPicker from "../FontPicker";
import StampCard from "./StampCard";

const WEIGHTS = [
  { v: "400", label: "Rg" },
  { v: "700", label: "Bd" },
  { v: "900", label: "Blk" },
];

const FONT_BUTTONS = [
  ...FONT_SETS.find((s) => s.script === "Latin").fonts.slice(0, 8),
  ...FONT_SETS.find((s) => s.script === "Arabic").fonts,
];

async function waitFonts() {
  await Promise.all([loadFont("Oswald"), loadFont("Roboto Mono"), loadFont("Cairo"), loadFont("Amiri")]);
  if (document.fonts?.ready) {
    await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);
  }
}

export default function TextTool() {
  const inkColor = useStampStore((s) => s.inkColor);
  const toast = useStampStore((s) => s.toast);
  const canvas = useStampStore((s) => s.canvas);
  const selected = useStampStore((s) => s.selected);
  const selVersion = useStampStore((s) => s.selVersion);
  const commit = useStampStore((s) => s.commit);
  const touch = useStampStore((s) => s.touchSelection);
  const refreshFields = useStampStore((s) => s.refreshFields);
  void selVersion;

  const selKind = selectionKind(selected);
  const editingSelection = selKind === "text" || selKind === "arc";
  const selText = editingSelection
    ? selKind === "arc"
      ? selected.stampMeta?.text || ""
      : selected.text || ""
    : "";

  const [text, setText] = useState("الرياض");
  const [weight, setWeight] = useState("700");
  const [font, setFont] = useState("Cairo");
  const [lookThumbs, setLookThumbs] = useState({});
  const [officeThumbs, setOfficeThumbs] = useState({});
  const [fieldThumbs, setFieldThumbs] = useState({});
  const [fieldLook, setFieldLook] = useState("round");
  const [dateFormat, setDateFormat] = useState("DD MMM YYYY");
  const custom = getCustomFonts();

  const rtl = isRTL(text);
  const sample = editingSelection ? selText : text;

  const updateSelectedText = (value) => {
    if (!editingSelection || !canvas) return;
    if (selKind === "arc") rebuildArc(canvas, selected, { text: value });
    else {
      const r = isRTL(value);
      selected.set({ text: value, direction: r ? "rtl" : "ltr", ...(r ? { charSpacing: 0 } : {}) });
      selected.setCoords();
      canvas.requestRenderAll();
    }
    touch();
  };

  const applyFont = async (family) => {
    await loadFont(family);
    setFont(family);
    if (editingSelection && canvas) {
      if (selKind === "arc") rebuildArc(canvas, selected, { fontFamily: family });
      else selected.set({ fontFamily: family });
      selected.setCoords?.();
      canvas.requestRenderAll();
      commit();
      touch();
    }
  };

  const add = async () => {
    const value = (text || "TEXT").trim();
    const family = font || fontForScript(value);
    await loadFont(family);
    addObject(
      createSpecObject({
        type: "text",
        text: value,
        fontSize: 44,
        fontFamily: family,
        fontWeight: weight,
        charSpacing: isRTL(value) ? 0 : 60,
        fill: inkColor,
        cx: CANVAS_SIZE / 2,
        cy: CANVAS_SIZE / 2,
        w: Math.max(220, Math.min(520, (value.length || 6) * 34)),
      })
    );
    toast("Text on canvas — click a look below to restyle", "success");
  };

  useEffect(() => {
    FONT_BUTTONS.forEach((f) => loadFont(f));
  }, []);

  useEffect(() => {
    let alive = true;
    const word = (sample || "TEXT").trim() || "TEXT";
    const timer = setTimeout(async () => {
      await waitFonts();
      await loadFont(font);
      if (!alive) return;
      const next = {};
      for (const look of STAMP_LOOKS) {
        if (!alive) return;
        try {
          next[look.id] = await renderTemplateThumb(
            { id: look.id, build: () => stampLookSpecs(word, look.id, inkColor, font) },
            140,
            inkColor
          );
        } catch {
          next[look.id] = null;
        }
      }
      if (alive) setLookThumbs(next);
    }, 180);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [sample, inkColor, font]);

  useEffect(() => {
    let alive = true;
    (async () => {
      await waitFonts();
      if (!alive) return;
      const next = {};
      for (const m of OFFICE_MARKS) {
        if (!alive) return;
        try {
          next[m.word] = await renderTemplateThumb(
            { id: m.word, build: () => markLookSpecs(m.word, m.look, inkColor, "Oswald") },
            140,
            inkColor
          );
        } catch {
          next[m.word] = null;
        }
      }
      if (alive) setOfficeThumbs(next);
    })();
    return () => {
      alive = false;
    };
  }, [inkColor]);

  useEffect(() => {
    let alive = true;
    (async () => {
      await waitFonts();
      if (!alive) return;
      const next = {};
      for (const f of FIELD_STAMPS) {
        if (!alive) return;
        try {
          next[f.id] = await renderTemplateThumb(
            { id: f.id, build: () => fieldLookSpecs(f.id, f.look, inkColor, dateFormat) },
            140,
            inkColor
          );
        } catch {
          next[f.id] = null;
        }
      }
      if (alive) setFieldThumbs(next);
    })();
    return () => {
      alive = false;
    };
  }, [inkColor, dateFormat]);

  return (
    <div>
      {editingSelection && (
        <div className="mb-3 border px-2 py-2" style={{ borderColor: "var(--border-soft)", background: "var(--bg-sunken)", borderRadius: "var(--radius)" }}>
          <div className="label mb-1.5">{selKind === "arc" ? "Selected curve" : "Selected text"}</div>
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

      <Fold title="Type" hint="add to canvas" open>
        <div className="tool-add mb-2">
          <input
            className="field"
            aria-label="Text content"
            dir={rtl ? "rtl" : "ltr"}
            style={{ fontFamily: font, fontWeight: weight, textAlign: rtl ? "right" : "left" }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder="Type a name…"
          />
          <button type="button" className="btn btn-accent" aria-label="Add text to canvas" onClick={add}>
            <Plus size={16} />
          </button>
        </div>
        <Row label="Weight">
          <div className="weight-grid">
            {WEIGHTS.map((w) => (
              <button
                key={w.v}
                type="button"
                className={`btn text-[10px] ${weight === w.v ? "btn-on" : ""}`}
                aria-pressed={weight === w.v}
                onClick={() => {
                  setWeight(w.v);
                  if (editingSelection) {
                    if (selKind === "arc") rebuildArc(canvas, selected, { fontWeight: w.v });
                    else selected.set({ fontWeight: w.v });
                    canvas?.requestRenderAll();
                    commit();
                    touch();
                  }
                }}
              >
                {w.label}
              </button>
            ))}
          </div>
        </Row>
        <FontPicker fonts={[...FONT_BUTTONS, ...custom]} value={font} onSelect={applyFont} />
      </Fold>

      <Fold title="Looks" hint="stamp + text" open>
        <div className="stamp-grid">
          {STAMP_LOOKS.map((look) => (
            <StampCard
              key={look.id}
              thumb={lookThumbs[look.id]}
              label={look.label}
              ariaLabel={`Apply ${look.label} look`}
              onClick={async () => {
                await waitFonts();
                await loadFont(font);
                applyStampLook(sample || text, look.id, inkColor, font);
              }}
            />
          ))}
        </div>
      </Fold>

      <Fold title="Phrases" open={false}>
        {TEXT_PHRASES.map((g) => (
          <Row key={g.group} label={g.group}>
            <div className="chip-grid">
              {g.items.map((ph) => (
                <button
                  key={ph}
                  type="button"
                  className="btn"
                  style={{ fontFamily: /[\u0600-\u06FF]/.test(ph) ? "Cairo" : undefined }}
                  onClick={() => {
                    setText(ph);
                    if (/[\u0600-\u06FF]/.test(ph)) applyFont("Cairo");
                  }}
                >
                  {ph}
                </button>
              ))}
            </div>
          </Row>
        ))}
      </Fold>

      <Fold title="Marks" hint="office stamps" open={false}>
        <div className="stamp-grid mb-2">
          {OFFICE_MARKS.map((m) => (
            <StampCard
              key={m.word}
              thumb={officeThumbs[m.word]}
              label={m.word}
              onClick={async () => {
                await waitFonts();
                applyMarkLook(m.word, m.look, inkColor, "Oswald");
              }}
            />
          ))}
        </div>
        <Row label="Frame">
          <div className="choice-grid">
            {MARK_LOOKS.map((item) => (
              <button
                key={item.id}
                type="button"
                className="btn"
                onClick={async () => {
                  await waitFonts();
                  applyMarkLook((sample || text || "APPROVED").trim(), item.id, inkColor, "Oswald");
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </Row>
      </Fold>

      <Fold title="Date & No." hint="live fields" open={false}>
        <div className="stamp-grid mb-2">
          {FIELD_STAMPS.map((f) => (
            <StampCard
              key={f.id}
              thumb={fieldThumbs[f.id]}
              label={f.label}
              onClick={async () => {
                await waitFonts();
                applyFieldLook(f.id, fieldLook || f.look, inkColor, dateFormat);
              }}
            />
          ))}
        </div>
        <Row label="Frame">
          <div className="choice-grid">
            {FIELD_LOOKS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`btn ${fieldLook === item.id ? "btn-on" : ""}`}
                aria-pressed={fieldLook === item.id}
                onClick={() => setFieldLook(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </Row>
        <Row label="Style">
          <div className="chip-grid">
            {DATE_FORMATS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`btn ${dateFormat === f.id ? "btn-on" : ""}`}
                aria-pressed={dateFormat === f.id}
                onClick={() => setDateFormat(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Row>
        <button type="button" className="btn w-full" onClick={() => refreshFields()}>
          <RefreshCw size={13} aria-hidden /> Refresh live fields
        </button>
      </Fold>
    </div>
  );
}
