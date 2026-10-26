import { useState } from "react";
import { Circle, RectangleHorizontal, Sparkles, Wand2 } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { generateAutoStamp } from "../../utils/actions";
import { fontForScript, loadFont } from "../../utils/fonts";
import { isRTL } from "../../utils/arabic";
import { Row } from "../ui";

const SHAPES = [
  { id: "round", label: "Round", icon: Circle },
  { id: "rect", label: "Rect", icon: RectangleHorizontal },
];

export default function AutoDesignTool() {
  const inkColor = useStampStore((s) => s.inkColor);
  const toast = useStampStore((s) => s.toast);

  const [busy, setBusy] = useState(false);
  const company = useStampStore((s) => s.company);
  const [genName, setGenName] = useState(company?.name || "");
  const [genCenter, setGenCenter] = useState("");
  const [genBottom, setGenBottom] = useState(company?.legal || "");
  const [genShape, setGenShape] = useState("round");

  const sample = genName || genCenter || genBottom;
  const rtl = isRTL(sample);
  const font = fontForScript(sample);

  const generate = async () => {
    if (!genName && !genCenter) {
      toast("Enter at least a name or centre word to generate", "info");
      return;
    }
    setBusy(true);
    await loadFont(font);
    await generateAutoStamp({
      name: genName,
      center: genCenter,
      bottom: genBottom,
      shape: genShape,
      ink: inkColor,
      font,
      logo: company?.logo,
    });
    setBusy(false);
  };

  return (
    <div className="space-y-2.5">
      <div
        className="flex items-start gap-2 border px-2.5 py-2"
        style={{ borderColor: "var(--border-soft)", background: "var(--bg-sunken)" }}
      >
        <Sparkles size={12} className="mt-0.5 shrink-0" style={{ color: "var(--text-dim)" }} aria-hidden />
        <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
          Type in any language. A complete balanced stamp is generated and stays fully editable.
        </p>
      </div>

      {company?.name ? (
        <button
          type="button"
          className="btn w-full text-[10px]"
          onClick={() => {
            setGenName(company.name || "");
            setGenBottom(company.legal || "");
          }}
        >
          Use company preset
        </button>
      ) : null}

      <Row label="Company name">
        <input
          className="field"
          dir="auto"
          style={{ fontFamily: font }}
          placeholder={rtl ? "اسم الشركة (القوس العلوي)" : "Top arc"}
          aria-label="Company name"
          value={genName}
          onChange={(e) => setGenName(e.target.value)}
        />
      </Row>

      <Row label="Centre word">
        <input
          className="field"
          dir="auto"
          style={{ fontFamily: font }}
          placeholder={rtl ? "الكلمة المركزية" : "Big centre word"}
          aria-label="Centre word"
          value={genCenter}
          onChange={(e) => setGenCenter(e.target.value)}
        />
      </Row>

      <Row label="Bottom line">
        <input
          className="field"
          dir="auto"
          style={{ fontFamily: font }}
          placeholder={rtl ? "سطر سفلي (اختياري)" : "Optional"}
          aria-label="Bottom line"
          value={genBottom}
          onChange={(e) => setGenBottom(e.target.value)}
        />
      </Row>

      <Row label="Shape">
        <div className="grid grid-cols-2 gap-1.5">
          {SHAPES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`btn flex-1 ${genShape === s.id ? "btn-on" : ""}`}
              aria-pressed={genShape === s.id}
              onClick={() => setGenShape(s.id)}
            >
              <s.icon size={12} aria-hidden />
              {s.label}
            </button>
          ))}
        </div>
      </Row>

      <button
        type="button"
        className="btn btn-accent w-full font-semibold"
        onClick={generate}
        disabled={busy}
      >
        <Wand2 size={13} aria-hidden />
        Generate Stamp
      </button>
    </div>
  );
}
