import { useState } from "react";
import {
  ChevronRight,
  Image as ImageIcon,
  Layers,
  LayoutGrid,
  Shapes,
  Type,
  Wrench,
} from "lucide-react";
import useStampStore from "../../store/useStampStore";
import DraggablePanel from "../DraggablePanel";
import TextTool from "./TextTool";
import ShapeTool from "./ShapeTool";
import ImageTool from "./ImageTool";
import TemplateGallery from "./TemplateGallery";
import LayersPanel from "./LayersPanel";

const SECTIONS = [
  { id: "text", label: "Text", icon: Type, Component: TextTool },
  { id: "shape", label: "Shapes & borders", icon: Shapes, Component: ShapeTool },
  { id: "image", label: "Logo / image", icon: ImageIcon, Component: ImageTool },
  { id: "template", label: "Templates", icon: LayoutGrid, Component: TemplateGallery },
  { id: "layers", label: "Layers", icon: Layers, Component: LayersPanel },
];

export default function LeftSidebar() {
  const [open, setOpen] = useState(["text", "layers"]);
  const leftOpen = useStampStore((s) => s.leftOpen);
  const toggleLeft = useStampStore((s) => s.toggleLeft);
  const pulse = useStampStore((s) => s.pulseTemplates);

  const toggle = (id) =>
    setOpen((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <DraggablePanel
      title="Tools"
      icon={Wrench}
      width={260}
      side="left"
      open={leftOpen}
      onClose={toggleLeft}
    >
      <div className="flex flex-col gap-1.5">
        {SECTIONS.map(({ id, label, icon: Icon, Component }) => {
          const isOpen = open.includes(id);
          const highlight = pulse && id === "template";
          return (
            <section
              key={id}
              className={`overflow-hidden rounded-xl border ${highlight ? "pulse-hint" : ""}`}
              style={{
                borderColor: highlight ? "var(--accent)" : "var(--border)",
                background: "color-mix(in srgb, var(--bg-primary) 45%, transparent)",
              }}
            >
              <button
                onClick={() => toggle(id)}
                className="flex w-full items-center gap-2 px-2.5 py-2.5 text-left"
              >
                <Icon size={14} style={{ color: "var(--accent)" }} />
                <span className="flex-1 text-[11px] font-bold uppercase tracking-wide">
                  {label}
                </span>
                <ChevronRight
                  size={14}
                  style={{
                    color: "var(--text-dim)",
                    transform: isOpen ? "rotate(90deg)" : "none",
                    transition: "transform .2s ease",
                  }}
                />
              </button>
              {isOpen && (
                <div className="border-t px-2.5 py-2.5" style={{ borderColor: "var(--border)" }}>
                  <Component />
                </div>
              )}
            </section>
          );
        })}
      </div>
    </DraggablePanel>
  );
}
