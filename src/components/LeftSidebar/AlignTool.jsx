import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
  FlipHorizontal,
  FlipVertical,
  Grid3x3,
  RotateCcw,
  RotateCw,
  Ruler,
  Scan,
} from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { alignToPaper, flipSelection, rotateSelection } from "../../utils/actions";
import { Row } from "../ui";

function Cell({ label, onClick, children }) {
  return (
    <button type="button" className="btn flex-col !gap-1 !px-0" style={{ minHeight: 48 }} onClick={onClick} aria-label={label}>
      {children}
      <span className="text-[8px] font-semibold uppercase tracking-wide" style={{ color: "var(--text-dim)" }}>
        {label}
      </span>
    </button>
  );
}

export default function AlignTool() {
  const selected = useStampStore((s) => s.selected);
  const showGrid = useStampStore((s) => s.showGrid);
  const toggleGrid = useStampStore((s) => s.toggleGrid);
  const showRulers = useStampStore((s) => s.showRulers);
  const toggleRulers = useStampStore((s) => s.toggleRulers);
  const showGuides = useStampStore((s) => s.showGuides);
  const toggleGuides = useStampStore((s) => s.toggleGuides);

  return (
    <div className="space-y-2.5">
      <Row label="On paper" hint={selected ? "selection" : "select first"}>
        <div className="grid grid-cols-3 gap-1.5">
          <Cell label="Left" onClick={() => alignToPaper("left")}>
            <AlignStartVertical size={14} />
          </Cell>
          <Cell label="Center" onClick={() => alignToPaper("both")}>
            <Scan size={14} />
          </Cell>
          <Cell label="Right" onClick={() => alignToPaper("right")}>
            <AlignEndVertical size={14} />
          </Cell>
          <Cell label="Top" onClick={() => alignToPaper("top")}>
            <AlignStartHorizontal size={14} />
          </Cell>
          <Cell label="Middle" onClick={() => alignToPaper("v")}>
            <AlignCenterHorizontal size={14} />
          </Cell>
          <Cell label="Bottom" onClick={() => alignToPaper("bottom")}>
            <AlignEndHorizontal size={14} />
          </Cell>
        </div>
      </Row>
      <Row label="Turn">
        <div className="grid grid-cols-4 gap-1.5">
          <Cell label="-15" onClick={() => rotateSelection(-15)}>
            <RotateCcw size={14} />
          </Cell>
          <Cell label="+15" onClick={() => rotateSelection(15)}>
            <RotateCw size={14} />
          </Cell>
          <Cell label="Flip H" onClick={() => flipSelection("h")}>
            <FlipHorizontal size={14} />
          </Cell>
          <Cell label="Flip V" onClick={() => flipSelection("v")}>
            <FlipVertical size={14} />
          </Cell>
        </div>
      </Row>
      <Row label="Guides">
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            className={`btn flex-col !gap-1 !px-0 ${showGuides ? "btn-on" : ""}`}
            style={{ minHeight: 48 }}
            aria-pressed={showGuides}
            onClick={toggleGuides}
          >
            <AlignCenterVertical size={14} />
            <span className="text-[8px] font-semibold uppercase">Cross</span>
          </button>
          <button
            type="button"
            className={`btn flex-col !gap-1 !px-0 ${showGrid ? "btn-on" : ""}`}
            style={{ minHeight: 48 }}
            aria-pressed={showGrid}
            onClick={toggleGrid}
          >
            <Grid3x3 size={14} />
            <span className="text-[8px] font-semibold uppercase">Grid</span>
          </button>
          <button
            type="button"
            className={`btn flex-col !gap-1 !px-0 ${showRulers ? "btn-on" : ""}`}
            style={{ minHeight: 48 }}
            aria-pressed={showRulers}
            onClick={toggleRulers}
          >
            <Ruler size={14} />
            <span className="text-[8px] font-semibold uppercase">Ruler</span>
          </button>
        </div>
      </Row>
    </div>
  );
}
