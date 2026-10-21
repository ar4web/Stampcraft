import { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  Crosshair,
  Group as GroupIcon,
  Layers,
  MousePointerClick,
  Sliders,
  Ungroup,
} from "lucide-react";
import useStampStore from "../../store/useStampStore";
import DraggablePanel from "../DraggablePanel";
import { Empty } from "../ui";
import { selectionKind } from "../../utils/canvas";
import { groupSelection, ungroupSelection } from "../../utils/actions";
import LayersPanel from "./LayersPanel";
import TextProperties from "./TextProperties";
import ShapeProperties from "./ShapeProperties";
import ImageProperties from "./ImageProperties";
import TransformBlock from "./TransformBlock";

function Section({ id, label, icon: Icon, openIds, setOpenIds, children, count, innerRef }) {
  const isOpen = openIds.includes(id);
  return (
    <section className="card" ref={innerRef}>
      <button
        type="button"
        onClick={() =>
          setOpenIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
        }
        aria-expanded={isOpen}
        className={`section-head flex w-full items-center gap-1.5 px-2.5 py-1.5 text-left ${
          isOpen ? "section-head-open" : ""
        }`}
      >
        <Icon size={13} style={{ color: "var(--accent)" }} />
        <span className="flex-1 truncate text-[10px] font-semibold uppercase tracking-[0.06em]">{label}</span>
        {count != null && (
          <span className="text-[10px] tabular-nums font-medium" style={{ color: "var(--text-dim)" }}>
            {count}
          </span>
        )}
        <ChevronRight
          size={13}
          style={{
            color: "var(--text-dim)",
            transform: isOpen ? "rotate(90deg)" : "none",
            transition: "transform .18s ease",
          }}
        />
      </button>
      {isOpen && (
        <div className="border-t p-2.5" style={{ borderColor: "var(--border-soft)" }}>
          {children}
        </div>
      )}
    </section>
  );
}

export default function RightPanel() {
  const rightOpen = useStampStore((s) => s.rightOpen);
  const toggleRight = useStampStore((s) => s.toggleRight);
  const selected = useStampStore((s) => s.selected);
  const selVersion = useStampStore((s) => s.selVersion);
  const canvas = useStampStore((s) => s.canvas);
  const layerVersion = useStampStore((s) => s.layerVersion);
  const [openIds, setOpenIds] = useState(["layers", "props", "transform"]);
  const focusSection = useStampStore((s) => s.focusSection);
  const sectionRefs = useRef({});
  const kind = selectionKind(selected);

  // External requests (Ctrl+K, toolbar) open and scroll to a section.
  useEffect(() => {
    if (!focusSection) return;
    const target =
      focusSection === "transform" && (kind === "text" || kind === "arc")
        ? "props"
        : focusSection;
    setOpenIds((p) => (p.includes(target) ? p : [...p, target]));
    const node = sectionRefs.current[target];
    if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [focusSection, kind]);
  void selVersion;
  void layerVersion;

  const layerCount = canvas ? canvas.getObjects().length : 0;

  return (
    <DraggablePanel
      title="Layers & properties"
      icon={Sliders}
      width={300}
      side="right"
      open={rightOpen}
      onClose={toggleRight}
    >
      <div className="flex flex-col gap-2">
        <Section
          innerRef={(el) => (sectionRefs.current.layers = el)}
          id="layers"
          label="Layers"
          icon={Layers}
          count={layerCount}
          openIds={openIds}
          setOpenIds={setOpenIds}
        >
          <LayersPanel />
        </Section>

        <Section
          id="props"
          innerRef={(el) => (sectionRefs.current.props = el)}
          label={
            kind === "text" || kind === "arc"
              ? "Text properties"
              : kind
                ? `${kind} properties`
                : "Properties"
          }
          icon={Sliders}
          openIds={openIds}
          setOpenIds={setOpenIds}
        >
          {!selected ? (
            <Empty
              icon={MousePointerClick}
              title="Nothing selected"
              hint="Pick a layer above or click it on the canvas."
            />
          ) : kind === "multi" ? (
            <div>
              <p className="mb-2 text-[10px]" style={{ color: "var(--text-dim)" }}>
                {selected.size()} layers selected
              </p>
              <div className="flex gap-1.5">
                <button type="button" className="btn flex-1" onClick={groupSelection}>
                  <GroupIcon size={15} /> Group
                </button>
                <button type="button" className="btn flex-1" onClick={ungroupSelection}>
                  <Ungroup size={15} /> Ungroup
                </button>
              </div>
            </div>
          ) : (
            <>
              {(kind === "text" || kind === "arc") && (
                <TextProperties obj={selected} kind={kind} />
              )}
              {kind === "shape" && <ShapeProperties obj={selected} />}
              {(kind === "image" || kind === "textured") && <ImageProperties obj={selected} />}
              {kind === "group" && (
                <button type="button" className="btn w-full" onClick={ungroupSelection}>
                  <Ungroup size={15} /> Ungroup layers
                </button>
              )}
            </>
          )}
        </Section>

        {selected && kind !== "text" && kind !== "arc" && (
          <Section
            id="transform"
            innerRef={(el) => (sectionRefs.current.transform = el)}
            label="Transform"
            icon={Crosshair}
            openIds={openIds}
            setOpenIds={setOpenIds}
          >
            <TransformBlock obj={selected} />
          </Section>
        )}

      </div>
    </DraggablePanel>
  );
}
