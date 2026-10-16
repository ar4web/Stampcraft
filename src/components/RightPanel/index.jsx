import { useState } from "react";
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  ArrowDownToLine,
  ArrowUpToLine,
  Copy,
  Group as GroupIcon,
  MousePointerClick,
  Sliders,
  Sparkles,
  Trash2,
  Ungroup,
} from "lucide-react";
import useStampStore from "../../store/useStampStore";
import DraggablePanel from "../DraggablePanel";
import { Empty, Row, Slider } from "../ui";
import { applyInkTexture, removeInkTexture, selectionKind } from "../../utils/canvas";
import {
  alignSelection,
  bringToFront,
  deleteSelection,
  duplicateSelection,
  groupSelection,
  sendToBack,
  ungroupSelection,
} from "../../utils/actions";
import TextProperties from "./TextProperties";
import ShapeProperties from "./ShapeProperties";
import ImageProperties from "./ImageProperties";

function TransformBlock({ obj }) {
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

  return (
    <>
      <Slider
        label="Rotation"
        value={Math.round(obj.angle ?? 0)}
        min={-180}
        max={180}
        onChange={(v) => update({ angle: v })}
        suffix="°"
      />
      <Slider
        label="Scale"
        value={Math.round((obj.scaleX ?? 1) * 100)}
        min={10}
        max={400}
        onChange={(v) => update({ scaleX: v / 100, scaleY: v / 100 })}
        suffix="%"
      />
      <Row label="Align to stamp centre">
        <div className="flex gap-1.5">
          <button className="btn flex-1" title="Centre horizontally" onClick={() => alignSelection("h")}>
            <AlignCenterVertical size={14} />
          </button>
          <button className="btn flex-1" title="Centre vertically" onClick={() => alignSelection("v")}>
            <AlignCenterHorizontal size={14} />
          </button>
          <button className="btn flex-1" title="Centre both" onClick={() => alignSelection("both")}>
            ⊕
          </button>
        </div>
      </Row>
      <Row label="Arrange">
        <div className="flex gap-1.5">
          <button className="btn flex-1" title="Bring to front" onClick={bringToFront}>
            <ArrowUpToLine size={14} />
          </button>
          <button className="btn flex-1" title="Send to back" onClick={sendToBack}>
            <ArrowDownToLine size={14} />
          </button>
          <button className="btn flex-1" title="Duplicate" onClick={duplicateSelection}>
            <Copy size={14} />
          </button>
          <button className="btn flex-1" title="Delete" onClick={deleteSelection}>
            <Trash2 size={14} />
          </button>
        </div>
      </Row>
    </>
  );
}

function TextureBlock({ obj, kind }) {
  const canvas = useStampStore((s) => s.canvas);
  const commit = useStampStore((s) => s.commit);
  const sync = useStampStore((s) => s.syncSelection);
  const toast = useStampStore((s) => s.toast);
  const [intensity, setIntensity] = useState(obj.stampMeta?.intensity ?? 35);
  const [busy, setBusy] = useState(false);

  const apply = async () => {
    setBusy(true);
    try {
      await applyInkTexture(canvas, obj, intensity);
      commit();
      sync();
      toast(`Ink texture applied at ${intensity}%`, "success");
    } catch (e) {
      toast(`Texture failed: ${e.message}`, "error");
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    setBusy(true);
    try {
      await removeInkTexture(canvas, obj);
      commit();
      sync();
      toast("Vector layer restored", "info");
    } catch (e) {
      toast(`Restore failed: ${e.message}`, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="mt-3 rounded-xl border p-2.5"
      style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--bg-primary) 45%, transparent)" }}
    >
      <div className="mb-2 flex items-center gap-1.5">
        <Sparkles size={13} style={{ color: "var(--accent)" }} />
        <span className="text-[11px] font-bold uppercase tracking-wide">Ink texture</span>
      </div>
      <Slider
        label="Distress intensity"
        value={intensity}
        min={0}
        max={100}
        onChange={setIntensity}
        suffix="%"
      />
      <div className="flex gap-1.5">
        <button className="btn btn-accent flex-1" disabled={busy} onClick={apply}>
          {busy ? "Working…" : kind === "textured" ? "Re-apply" : "Apply"}
        </button>
        {kind === "textured" && (
          <button className="btn flex-1" disabled={busy} onClick={restore}>
            Restore
          </button>
        )}
      </div>
    </div>
  );
}

export default function RightPanel() {
  const rightOpen = useStampStore((s) => s.rightOpen);
  const toggleRight = useStampStore((s) => s.toggleRight);
  const selected = useStampStore((s) => s.selected);
  const selVersion = useStampStore((s) => s.selVersion);
  void selVersion;

  const kind = selectionKind(selected);

  return (
    <DraggablePanel
      title={kind ? `${kind} properties` : "Properties"}
      icon={Sliders}
      width={280}
      side="right"
      open={rightOpen}
      onClose={toggleRight}
    >
      {!selected ? (
        <Empty
          icon={MousePointerClick}
          title="Nothing selected"
          hint="Pick a layer on the canvas or in the layers list to edit its typography, strokes, colours and ink texture."
        />
      ) : kind === "multi" ? (
        <div>
          <p className="mb-3 text-[11px]" style={{ color: "var(--text-dim)" }}>
            {selected.size()} layers selected
          </p>
          <div className="mb-2.5 flex gap-1.5">
            <button className="btn flex-1" onClick={groupSelection}>
              <GroupIcon size={14} /> Group
            </button>
            <button className="btn flex-1" onClick={ungroupSelection}>
              <Ungroup size={14} /> Ungroup
            </button>
          </div>
          <TransformBlock obj={selected} />
        </div>
      ) : (
        <div>
          <p className="mb-2 truncate text-[11px] font-semibold" style={{ color: "var(--text-dim)" }}>
            {selected.name || kind}
          </p>
          {(kind === "text" || kind === "arc") && (
            <TextProperties obj={selected} kind={kind} />
          )}
          {kind === "shape" && <ShapeProperties obj={selected} />}
          {(kind === "image" || kind === "textured") && <ImageProperties obj={selected} />}
          {kind === "group" && (
            <div className="mb-2.5">
              <button className="btn w-full" onClick={ungroupSelection}>
                <Ungroup size={14} /> Ungroup layers
              </button>
            </div>
          )}
          <div className="my-3 h-px" style={{ background: "var(--border)" }} />
          <TransformBlock obj={selected} />
          <TextureBlock key={selected.id || "tex"} obj={selected} kind={kind} />
        </div>
      )}
    </DraggablePanel>
  );
}
