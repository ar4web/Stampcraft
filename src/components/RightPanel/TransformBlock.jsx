import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  ArrowDownToLine,
  ArrowUpToLine,
  Copy,
  Crosshair,
  Trash2,
} from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { Slider } from "../ui";
import {
  alignSelection,
  bringToFront,
  deleteSelection,
  duplicateSelection,
  sendToBack,
} from "../../utils/actions";
import Tooltip from "../Tooltip";

export default function TransformBlock({ obj }) {
  const canvas = useStampStore((s) => s.canvas);
  const commit = useStampStore((s) => s.commit);
  const touch = useStampStore((s) => s.touchSelection);

  const update = (patch) => {
    obj.set(patch);
    obj.setCoords();
    canvas.requestRenderAll();
    commit();
    touch();
  };

  const Act = ({ title, onClick, icon: Icon, danger }) => (
    <Tooltip label={title} side="top" delay={120}>
      <button
        type="button"
        className={`btn btn-icon ${danger ? "btn-danger" : ""}`}
        aria-label={title}
        onClick={onClick}
      >
        <Icon size={15} />
      </button>
    </Tooltip>
  );

  return (
    <>
      <div className="mb-2 flex min-w-0 items-start gap-3 overflow-hidden">
        <div className="shrink-0">
          <span className="label mb-1 block">Align</span>
          <div className="icon-row">
            <Act title="Centre horizontally" icon={AlignCenterVertical} onClick={() => alignSelection("h")} />
            <Act title="Centre vertically" icon={AlignCenterHorizontal} onClick={() => alignSelection("v")} />
            <Act title="Centre both" icon={Crosshair} onClick={() => alignSelection("both")} />
          </div>
        </div>
        <div className="min-w-0">
          <span className="label mb-1 block">Arrange</span>
          <div className="icon-row">
            <Act title="Bring to front" icon={ArrowUpToLine} onClick={bringToFront} />
            <Act title="Send to back" icon={ArrowDownToLine} onClick={sendToBack} />
            <Act title="Duplicate" icon={Copy} onClick={duplicateSelection} />
            <Act title="Delete" icon={Trash2} danger onClick={deleteSelection} />
          </div>
        </div>
      </div>
      <Slider
        label="Scale"
        value={Math.round((obj.scaleX ?? 1) * 100)}
        min={10}
        max={400}
        onChange={(v) => update({ scaleX: v / 100, scaleY: v / 100 })}
        suffix="%"
      />
      <Slider
        label="Angle"
        value={Math.round(obj.angle ?? 0)}
        min={-180}
        max={180}
        onChange={(v) => update({ angle: v })}
        suffix="°"
      />
    </>
  );
}
