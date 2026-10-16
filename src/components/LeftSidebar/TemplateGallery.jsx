import { useEffect, useState } from "react";
import { TEMPLATES } from "../../templates";
import { renderTemplateThumb } from "../../utils/canvas";
import { loadTemplate } from "../../utils/actions";
import useStampStore from "../../store/useStampStore";

const cache = new Map();

export function useTemplateThumbs(list = TEMPLATES) {
  const [thumbs, setThumbs] = useState(() => Object.fromEntries(cache));

  useEffect(() => {
    let alive = true;
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 60));
    const pending = list.filter((t) => !cache.has(t.id));
    if (!pending.length) return;
    idle(async () => {
      for (const tpl of pending) {
        if (!alive) return;
        try {
          const url = await renderTemplateThumb(tpl);
          cache.set(tpl.id, url);
          if (alive) setThumbs((prev) => ({ ...prev, [tpl.id]: url }));
        } catch (e) {
          console.warn("thumb failed", tpl.id, e);
        }
      }
    });
    return () => {
      alive = false;
    };
  }, [list]);

  return thumbs;
}

export function TemplateCard({ tpl, thumb, onClick, large }) {
  return (
    <button
      onClick={onClick}
      className="group overflow-hidden rounded-xl border text-left"
      style={{ borderColor: "var(--border)", background: "var(--bg-primary)" }}
    >
      <div
        className="checkerboard grid aspect-square w-full place-items-center p-2"
        style={{ backgroundSize: "12px 12px" }}
      >
        {thumb ? (
          <img
            src={thumb}
            alt={tpl.name}
            className="h-full w-full object-contain transition-transform group-hover:scale-105"
            style={{ filter: "drop-shadow(0 0 1px rgba(255,255,255,.35))" }}
            loading="lazy"
          />
        ) : (
          <div className="h-4 w-4 animate-pulse rounded-full" style={{ background: "var(--border)" }} />
        )}
      </div>
      <div className="border-t px-2 py-1.5" style={{ borderColor: "var(--border)" }}>
        <p className={`truncate font-semibold ${large ? "text-xs" : "text-[10px]"}`}>{tpl.name}</p>
        {large && (
          <p className="truncate text-[10px]" style={{ color: "var(--text-dim)" }}>
            {tpl.tags?.join(" · ")}
          </p>
        )}
      </div>
    </button>
  );
}

export default function TemplateGallery() {
  const thumbs = useTemplateThumbs();
  const openModal = useStampStore((s) => s.openModal);

  return (
    <div>
      <div className="mb-2 grid grid-cols-2 gap-2">
        {TEMPLATES.slice(0, 6).map((tpl) => (
          <TemplateCard
            key={tpl.id}
            tpl={tpl}
            thumb={thumbs[tpl.id]}
            onClick={() => loadTemplate(tpl)}
          />
        ))}
      </div>
      <button className="btn w-full" onClick={() => openModal("template")}>
        Browse all 12 templates
      </button>
    </div>
  );
}
