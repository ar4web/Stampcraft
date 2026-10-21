import { BookmarkPlus, Trash2 } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { EXTRA_PROPS, serialize, thumbnail } from "../../utils/canvas";
import { placeClip } from "../../utils/actions";
import { Empty, Row } from "../ui";

export default function ClipTool() {
  const clips = useStampStore((s) => s.clips);
  const canvas = useStampStore((s) => s.canvas);
  const selected = useStampStore((s) => s.selected);
  const addClip = useStampStore((s) => s.addClip);
  const removeClip = useStampStore((s) => s.removeClip);
  const toast = useStampStore((s) => s.toast);

  const saveSelection = async () => {
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) {
      toast("Select layers to save as a clip", "info");
      return;
    }
    let json;
    if (active.type === "activeselection") {
      json = { objects: active.getObjects().map((o) => o.toObject(EXTRA_PROPS)) };
    } else {
      json = { objects: [active.toObject(EXTRA_PROPS)] };
    }
    const name =
      active.name ||
      (active.type === "activeselection" ? `Clip (${active.getObjects().length})` : "Clip");
    addClip({ name, json, thumb: thumbnail(canvas) });
  };

  const saveStamp = () => {
    if (!canvas) return;
    const json = serialize(canvas);
    if (!(json.objects || []).length) {
      toast("Nothing on the paper to clip", "info");
      return;
    }
    addClip({ name: useStampStore.getState().designName || "Stamp clip", json, thumb: thumbnail(canvas) });
  };

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 gap-1.5">
        <button type="button" className="btn text-[9px]" onClick={saveSelection} disabled={!selected}>
          <BookmarkPlus size={12} />
          Selection
        </button>
        <button type="button" className="btn text-[9px]" onClick={saveStamp}>
          <BookmarkPlus size={12} />
          Whole stamp
        </button>
      </div>
      <Row label="Clips" hint={`${clips.length}/24`}>
        {clips.length === 0 ? (
          <Empty title="No clips yet" hint="Save a selection or the whole stamp to reuse later." />
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {clips.map((clip) => (
              <div key={clip.id} className="group relative border" style={{ borderColor: "var(--border-soft)" }}>
                <button type="button" className="block w-full" onClick={() => placeClip(clip)} aria-label={`Place ${clip.name}`}>
                  <span className="checkerboard grid aspect-square w-full place-items-center p-1">
                    {clip.thumb ? (
                      <img src={clip.thumb} alt="" className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-[9px]" style={{ color: "var(--text-mute)" }}>
                        {clip.name}
                      </span>
                    )}
                  </span>
                </button>
                <div className="flex items-center justify-between gap-1 px-1 py-0.5">
                  <span className="truncate text-[8px] font-medium" style={{ color: "var(--text-dim)" }}>
                    {clip.name}
                  </span>
                  <button
                    type="button"
                    className="btn-ghost btn-icon !h-5 !w-5"
                    aria-label={`Remove ${clip.name}`}
                    onClick={() => removeClip(clip.id)}
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Row>
    </div>
  );
}
