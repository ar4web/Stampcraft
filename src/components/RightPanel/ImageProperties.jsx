import { FlipHorizontal, FlipVertical, Sparkles, Eraser } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { applyStampFilter, clearObjectClip, clipObjectToRing } from "../../utils/canvas";
import { removeImageBackground, vectorizeImage } from "../../utils/image";
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
          <Checkbox
            label="Clip to frame"
            checked={!!meta.clippedToRing}
            onChange={async (on) => {
              try {
                if (on) await clipObjectToRing(canvas, obj);
                else clearObjectClip(canvas, obj);
                commit();
                touch();
              } catch (e) {
                toast(e.message, "info");
              }
            }}
            hint="Fit the logo inside the outer ring."
          />
          <Row label="Logo">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                className="btn text-[10px]"
                onClick={async () => {
                  try {
                    await removeImageBackground(canvas, obj);
                    commit();
                    touch();
                    toast("Background removed", "success");
                  } catch (e) {
                    toast(e.message, "error");
                  }
                }}
              >
                <Eraser size={12} aria-hidden /> Knock out
              </button>
              <button
                type="button"
                className="btn text-[10px]"
                onClick={async () => {
                  try {
                    const ink = useStampStore.getState().inkColor;
                    await vectorizeImage(canvas, obj, ink);
                    commit();
                    useStampStore.getState().syncSelection();
                    toast("Converted to vector — recolor with Ink", "success");
                  } catch (e) {
                    toast(e.message, "error");
                  }
                }}
              >
                <Sparkles size={12} aria-hidden /> To SVG
              </button>
            </div>
          </Row>
        </>
      )}
    </div>
  );
}
