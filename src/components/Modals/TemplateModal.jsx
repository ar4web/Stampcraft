import { useState } from "react";
import useStampStore from "../../store/useStampStore";
import { TEMPLATES } from "../../templates";
import { loadTemplate } from "../../utils/actions";
import Modal from "./Modal";
import { TemplateCard, useTemplateThumbs } from "../LeftSidebar/TemplateGallery";

export default function TemplateModal() {
  const closeModal = useStampStore((s) => s.closeModal);
  const thumbs = useTemplateThumbs();
  const [query, setQuery] = useState("");

  const list = TEMPLATES.filter((t) =>
    (t.name + " " + (t.tags || []).join(" ")).toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Modal
      title="Stamp templates"
      subtitle="12 ready-made master layouts — click one to load it onto the canvas"
      onClose={closeModal}
      width={820}
    >
      <input
        className="field mb-4 !w-full"
        placeholder="Search templates (round, oval, date, seal…)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {list.map((tpl) => (
          <TemplateCard
            key={tpl.id}
            tpl={tpl}
            thumb={thumbs[tpl.id]}
            large
            onClick={() => {
              loadTemplate(tpl);
              closeModal();
            }}
          />
        ))}
      </div>
      {!list.length && (
        <p className="py-10 text-center text-xs" style={{ color: "var(--text-dim)" }}>
          No templates match “{query}”.
        </p>
      )}
    </Modal>
  );
}
