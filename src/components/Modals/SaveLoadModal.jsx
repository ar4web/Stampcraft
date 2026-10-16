import { useState } from "react";
import { Save, Trash2, Upload, Pencil } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { renameDesign } from "../../utils/storage";
import Modal from "./Modal";

export default function SaveLoadModal() {
  const {
    closeModal,
    designs,
    designName,
    setDesignName,
    saveCurrent,
    saveAsNew,
    loadDesign,
    removeDesign,
    refreshDesigns,
    currentDesignId,
  } = useStampStore();
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");

  return (
    <Modal
      title="My designs"
      subtitle="Everything is stored locally in your browser — no account needed"
      onClose={closeModal}
    >
      <div className="mb-4 flex flex-wrap items-end gap-2">
        <div className="min-w-[180px] flex-1">
          <div className="label mb-1">Design name</div>
          <input
            className="field"
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
          />
        </div>
        <button className="btn btn-accent" onClick={() => saveCurrent()}>
          <Save size={14} /> {currentDesignId ? "Update" : "Save"}
        </button>
        <button className="btn" onClick={() => saveAsNew()}>
          Save as copy
        </button>
      </div>

      {!designs.length ? (
        <p className="py-10 text-center text-xs" style={{ color: "var(--text-dim)" }}>
          No saved designs yet. Save your current stamp to build a library.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {designs.map((d) => (
            <div
              key={d.id}
              className="overflow-hidden rounded-xl border"
              style={{
                borderColor: d.id === currentDesignId ? "var(--accent)" : "var(--border)",
                background: "var(--bg-primary)",
              }}
            >
              <div className="checkerboard grid aspect-square place-items-center p-2" style={{ backgroundSize: "12px 12px" }}>
                {d.thumb ? (
                  <img src={d.thumb} alt={d.name} className="h-full w-full object-contain" />
                ) : (
                  <span className="text-[10px]" style={{ color: "var(--text-dim)" }}>
                    no preview
                  </span>
                )}
              </div>
              <div className="border-t p-2" style={{ borderColor: "var(--border)" }}>
                {editing === d.id ? (
                  <input
                    autoFocus
                    className="field mb-1.5"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => {
                      renameDesign(d.id, draft || d.name);
                      refreshDesigns();
                      setEditing(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                  />
                ) : (
                  <p className="mb-1 truncate text-[11px] font-semibold">{d.name}</p>
                )}
                <p className="mb-2 text-[10px]" style={{ color: "var(--text-dim)" }}>
                  {new Date(d.updated).toLocaleString()}
                </p>
                <div className="flex gap-1">
                  <button
                    className="btn flex-1 !px-1"
                    title="Load"
                    onClick={async () => {
                      await loadDesign(d.id);
                      closeModal();
                    }}
                  >
                    <Upload size={13} />
                  </button>
                  <button
                    className="btn !px-1.5"
                    title="Rename"
                    onClick={() => {
                      setEditing(d.id);
                      setDraft(d.name);
                    }}
                  >
                    <Pencil size={13} />
                  </button>
                  <button className="btn !px-1.5" title="Delete" onClick={() => removeDesign(d.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
