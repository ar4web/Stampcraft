import { CANVAS_SIZE } from "../../utils/canvas";

const PX_PER_MM = 10; // 620px artboard === 62mm stamp

/** Thin mm/cm rulers drawn as SVG overlays on the top and left edges. */
export default function Rulers({ zoom }) {
  const length = CANVAS_SIZE * zoom;
  const stepMM = zoom < 0.8 ? 10 : 5;
  const ticks = [];
  const totalMM = CANVAS_SIZE / PX_PER_MM;
  for (let mm = 0; mm <= totalMM; mm += stepMM) {
    const pos = mm * PX_PER_MM * zoom;
    const major = mm % 10 === 0;
    ticks.push({ pos, major, label: major ? `${mm / 10}` : null });
  }

  const common = { stroke: "var(--text-dim)", strokeWidth: 1 };

  return (
    <>
      <svg
        className="pointer-events-none absolute left-0 top-[-18px]"
        width={length}
        height={18}
        style={{ background: "var(--bg-panel)", borderBottom: "1px solid var(--border)" }}
      >
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={t.pos} y1={t.major ? 7 : 12} x2={t.pos} y2={18} {...common} />
            {t.label && (
              <text x={t.pos + 2} y={9} fontSize="8" fill="var(--text-dim)">
                {t.label}cm
              </text>
            )}
          </g>
        ))}
      </svg>
      <svg
        className="pointer-events-none absolute left-[-18px] top-0"
        width={18}
        height={length}
        style={{ background: "var(--bg-panel)", borderRight: "1px solid var(--border)" }}
      >
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={t.major ? 7 : 12} y1={t.pos} x2={18} y2={t.pos} {...common} />
            {t.label && (
              <text
                x={6}
                y={t.pos + 2}
                fontSize="8"
                fill="var(--text-dim)"
                transform={`rotate(-90 6 ${t.pos + 2})`}
              >
                {t.label}cm
              </text>
            )}
          </g>
        ))}
      </svg>
      <div
        className="pointer-events-none absolute left-[-18px] top-[-18px] h-[18px] w-[18px] border-b border-r"
        style={{ background: "var(--bg-panel)", borderColor: "var(--border)" }}
      />
    </>
  );
}
