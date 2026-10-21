import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Layers,
  Lock,
  Shapes,
  Spline,
  Trash2,
  Type,
  Unlock,
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

  void layerVersion;
  void selVersion;
  if (!canvas) return null;

  const objects = canvas.getObjects();
  const active = canvas.getActiveObject();

  if (!objects.length)
    return <Empty icon={Layers} title="No layers yet" hint="Add text, a shape or a logo to begin." />;

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

  const Mini = ({ title, onClick, children, on, danger }) => (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`grid h-7 w-7 shrink-0 place-items-center transition-colors ${
        danger ? "danger-hover" : "hover:text-white"
      }`}
      style={{ color: on ? "var(--accent)" : "var(--text-dim)" }}
    >
      {children}
    </button>
  );

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
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), select(obj))}
              className="flex cursor-pointer items-center gap-1 border px-2 py-1.5"
              aria-pressed={isActive}
              style={{
                borderColor: isActive ? "var(--accent)" : "var(--border-soft)",
                background: isActive ? "var(--bg-raised)" : "var(--bg-sunken)",
                opacity: obj.visible === false ? 0.45 : 1,
              }}
            >
              <Icon size={14} style={{ color: "var(--text-dim)" }} className="shrink-0" />
               <span className="min-w-0 flex-1 truncate text-[11px] font-medium">{obj.name || kind}</span>
              <Mini
                title="Move up"
                onClick={() => {
                  canvas.setActiveObject(obj);
                  bringForward();
                  touchLayers();
                }}
              >
                <ChevronUp size={13} />
              </Mini>
              <Mini
                title="Move down"
                onClick={() => {
                  canvas.setActiveObject(obj);
                  sendBackwards();
                  touchLayers();
                }}
              >
                <ChevronDown size={13} />
              </Mini>
              <Mini title={obj.visible === false ? "Show" : "Hide"} onClick={() => toggleVisible(obj)}>
                {obj.visible === false ? <EyeOff size={13} /> : <Eye size={13} />}
              </Mini>
              <Mini
                title={obj.lockedLayer ? "Unlock" : "Lock"}
                on={!!obj.lockedLayer}
                onClick={() => toggleLock(obj)}
              >
                {obj.lockedLayer ? <Lock size={13} /> : <Unlock size={13} />}
              </Mini>
              <Mini title="Delete layer" danger onClick={() => remove(obj)}>
                <Trash2 size={13} />
              </Mini>
            </div>
          );
        })}
    </div>
  );
}
