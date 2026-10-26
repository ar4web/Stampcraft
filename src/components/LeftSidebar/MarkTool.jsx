import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { renderTemplateThumb } from "../../utils/canvas";
import { applyMarkLook, markLookSpecs } from "../../utils/actions";
import { loadFont } from "../../utils/fonts";
import { MARK_LOOKS, OFFICE_MARKS } from "../../utils/phrases";
import { Row } from "../ui";

function StampCard({ thumb, label, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      className="group overflow-hidden border text-left transition-colors"
      style={{ borderColor: "var(--border-soft)", background: "var(--bg-sunken)" }}
      onClick={onClick}
      aria-label={ariaLabel || `Apply ${label} stamp`}
    >
      <span
        className="checkerboard grid aspect-square w-full place-items-center p-1.5"
        style={{ backgroundSize: "10px 10px" }}
      >
        {thumb ? (
          <img
            src={thumb}
            alt=""
            className="h-full w-full object-contain transition-transform duration-150 group-hover:scale-[1.04]"
          />
        ) : (
          <span className="h-3 w-3 animate-pulse" style={{ background: "var(--border)" }} />
        )}
      </span>
      <span className="block truncate px-1 py-0.5 text-center text-[9px] font-semibold tracking-wide">
        {label}
      </span>
    </button>
  );
}

export default function MarkTool() {
  const ink = useStampStore((s) => s.inkColor);
  const toast = useStampStore((s) => s.toast);
  const [custom, setCustom] = useState("");
  const [look, setLook] = useState("round");
  const [officeThumbs, setOfficeThumbs] = useState({});
  const [lookThumbs, setLookThumbs] = useState({});

  const apply = async (word, nextLook) => {
    const value = (word || "").trim();
    if (!value) {
      toast("Type a word first", "info");
      return;
    }
    await Promise.all([loadFont("Oswald"), loadFont("Roboto Mono"), loadFont("Cairo")]);
    applyMarkLook(value, nextLook || look, ink, "Oswald");
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      await Promise.all([loadFont("Oswald"), loadFont("Roboto Mono")]);
      if (document.fonts?.ready) {
        await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2000))]);
      }
      if (!alive) return;
      const next = {};
      for (const m of OFFICE_MARKS) {
        if (!alive) return;
        try {
          next[m.word] = await renderTemplateThumb(
            { id: m.word, build: () => markLookSpecs(m.word, m.look, ink, "Oswald") },
            140,
            ink
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
  }, [ink]);

  useEffect(() => {
    let alive = true;
    const word = (custom.trim() || "APPROVED").toUpperCase();
    const timer = setTimeout(async () => {
      await Promise.all([loadFont("Oswald"), loadFont("Roboto Mono")]);
      if (!alive) return;
      const next = {};
      for (const item of MARK_LOOKS) {
        if (!alive) return;
        try {
          next[item.id] = await renderTemplateThumb(
            { id: item.id, build: () => markLookSpecs(word, item.id, ink, "Oswald") },
            140,
            ink
          );
        } catch {
          next[item.id] = null;
        }
      }
      if (alive) setLookThumbs(next);
    }, 160);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [custom, ink]);

  return (
    <div className="space-y-2.5">
      <Row label="Office stamps" hint="click to apply">
        <div className="grid grid-cols-2 gap-1.5">
          {OFFICE_MARKS.map((m) => (
            <StampCard
              key={m.word}
              thumb={officeThumbs[m.word]}
              label={m.word}
              onClick={() => apply(m.word, m.look)}
            />
          ))}
        </div>
      </Row>

      <Row label="Your word">
        <div className="flex gap-1">
          <input
            className="field flex-1"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="APPROVED"
            aria-label="Custom mark text"
            style={{ fontFamily: "Oswald", fontWeight: 700, letterSpacing: "0.08em" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") apply(custom, look);
            }}
          />
          <button
            type="button"
            className="btn btn-accent !px-2"
            onClick={() => apply(custom, look)}
            aria-label="Add custom mark stamp"
          >
            <Plus size={13} />
          </button>
        </div>
      </Row>

      <Row label="Looks" hint="stamp + text">
        <div className="grid grid-cols-2 gap-1.5">
          {MARK_LOOKS.map((item) => (
            <StampCard
              key={item.id}
              thumb={lookThumbs[item.id]}
              label={item.label}
              ariaLabel={`Apply ${item.label} look`}
              onClick={() => {
                setLook(item.id);
                apply(custom.trim() || "APPROVED", item.id);
              }}
            />
          ))}
        </div>
      </Row>
    </div>
  );
}
