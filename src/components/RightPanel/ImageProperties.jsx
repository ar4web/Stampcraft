import { FlipHorizontal, FlipVertical } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { applyStampFilter } from "../../utils/canvas";
import { Checkbox, Row, Slider } from "../ui";

export default function ImageProperties({ obj }) {
  const canvas = useStampStore((s) => s.canvas);
  const commit = useStampStore((s) => s.commit);
  const touch = useStampStore((s) => s.touchSelection);
  const toast = useStampStore((s) => s.toast);
  const meta = obj.stampMeta || {};

  const update = (patch) => {
    obj.set(patch);
    obj.setCoords();
    canvas.requestRenderAll();
    commit();
    touch();
  };

  const toggleFilter = async (on) => {
    try {
      await applyStampFilter(canvas, obj, on);
      commit();
      touch();
      toast(on ? "Stamp filter applied" : "Original image restored", "success");
    } catch (e) {
      toast(`Filter failed: ${e.message}`, "error");
    }
  };

  return (
    <div>
      <Slider
        label="Opacity"
        value={Math.round((obj.opacity ?? 1) * 100)}
        min={5}
        max={100}
        onChange={(v) => update({ opacity: v / 100 })}
        suffix="%"
      />
      <Row label="Flip">
        <div className="flex gap-1.5">
          <button type="button" className="btn flex-1" aria-label="Flip horizontal" onClick={() => update({ flipX: !obj.flipX })} title="Flip Horizontal">
            <FlipHorizontal size={15} /> Flip H
          </button>
          <button type="button" className="btn flex-1" aria-label="Flip vertical" onClick={() => update({ flipY: !obj.flipY })} title="Flip Vertical">
            <FlipVertical size={15} /> Flip V
          </button>
        </div>
      </Row>
      {obj.type === "image" && (
        <>
          <Checkbox
            label="Stamp filter"
            checked={!!meta.stampFilter}
            onChange={toggleFilter}
          />
          <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
            Grayscale + high contrast + knock-out background for a clean rubber
            ink impression.
          </p>
        </>
      )}
    </div>
  );
}
