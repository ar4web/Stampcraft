import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Lock,
  Shapes,
  Spline,
  Trash2,
  Type,
  Unlock,
  Layers,
} from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { selectionKind } from "../../utils/canvas";
import { bringForward, sendBackwards } from "../../utils/actions";
import { Empty } from "../ui";

const ICON = {
  text: Type,
  arc: Spline,
  image: ImageIcon,
  textured: ImageIcon,
  group: Layers,
  shape: Shapes,
};

export default function LayersPanel() {
  const canvas = useStampStore((s) => s.canvas);
  const layerVersion = useStampStore((s) => s.layerVersion);
  const selVersion = useStampStore((s) => s.selVersion);
  const commit = useStampStore((s) => s.commit);
  const syncSelection = useStampStore((s) => s.syncSelection);
  const touchLayers = useStampStore((s) => s.touchLayers);

  if (!canvas) return null;
  const objects = canvas.getObjects();
  const active = canvas.getActiveObject();
  void layerVersion;
  void selVersion;

  if (!objects.length)
    return <Empty icon={Layers} title="No layers yet" hint="Add text, shapes or a logo to get started." />;

  const select = (obj) => {
    if (obj.lockedLayer) return;
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
    syncSelection();
  };

  const toggleVisible = (obj) => {
    obj.visible = !obj.visible;
    if (!obj.visible && canvas.getActiveObject() === obj) canvas.discardActiveObject();
    canvas.requestRenderAll();
    commit();
    touchLayers();
  };

  const toggleLock = (obj) => {
    obj.lockedLayer = !obj.lockedLayer;
    obj.selectable = !obj.lockedLayer;
    obj.evented = !obj.lockedLayer;
    if (obj.lockedLayer && canvas.getActiveObject() === obj) canvas.discardActiveObject();
    canvas.requestRenderAll();
    commit();
    touchLayers();
    syncSelection();
  };

  const remove = (obj) => {
    canvas.remove(obj);
    canvas.requestRenderAll();
    commit();
    syncSelection();
  };

  return (
    <div className="flex flex-col gap-1">
      {objects
        .slice()
        .reverse()
        .map((obj, i) => {
          const kind = selectionKind(obj) || "shape";
          const Icon = ICON[kind] || Shapes;
          const isActive = active === obj;
          return (
            <div
              key={obj.id || i}
              onClick={() => select(obj)}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border px-1.5 py-1.5"
              style={{
                borderColor: isActive ? "var(--accent)" : "var(--border)",
                background: isActive
                  ? "color-mix(in srgb, var(--accent) 14%, transparent)"
                  : "transparent",
                opacity: obj.visible === false ? 0.45 : 1,
              }}
            >
              <Icon size={13} style={{ color: "var(--text-dim)" }} className="shrink-0" />
              <span className="flex-1 truncate text-[11px]">{obj.name || kind}</span>
              <button
                className="shrink-0 opacity-70 hover:opacity-100"
                title="Move up"
                onClick={(e) => {
                  e.stopPropagation();
                  canvas.setActiveObject(obj);
                  bringForward();
                  touchLayers();
                }}
              >
                <ChevronUp size={13} />
              </button>
              <button
                className="shrink-0 opacity-70 hover:opacity-100"
                title="Move down"
                onClick={(e) => {
                  e.stopPropagation();
                  canvas.setActiveObject(obj);
                  sendBackwards();
                  touchLayers();
                }}
              >
                <ChevronDown size={13} />
              </button>
              <button
                className="shrink-0 opacity-70 hover:opacity-100"
                title="Visibility"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleVisible(obj);
                }}
              >
                {obj.visible === false ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
              <button
                className="shrink-0 opacity-70 hover:opacity-100"
                title="Freeze layer"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLock(obj);
                }}
              >
                {obj.lockedLayer ? (
                  <Lock size={13} style={{ color: "var(--accent)" }} />
                ) : (
                  <Unlock size={13} />
                )}
              </button>
              <button
                className="shrink-0 opacity-70 hover:opacity-100"
                title="Delete layer"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(obj);
                }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          );
        })}
    </div>
  );
}
