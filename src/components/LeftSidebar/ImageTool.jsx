import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { addImageFromFile, applyStampFilter } from "../../utils/canvas";
import { Toggle } from "../ui";

export default function ImageTool() {
  const inputRef = useRef(null);
  const [hover, setHover] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoFilter, setAutoFilter] = useState(true);

  const handleFiles = async (files) => {
    const store = useStampStore.getState();
    const file = files?.[0];
    if (!file || !store.canvas) return;
    if (!/^image\//.test(file.type) && !/\.svg$/i.test(file.name)) {
      store.toast("Only PNG, JPG or SVG files are supported", "error");
      return;
    }
    setLoading(true);
    try {
      const obj = await addImageFromFile(store.canvas, file);
      if (autoFilter && obj.type === "image") {
        await applyStampFilter(store.canvas, obj, true);
      }
      store.commit();
      store.syncSelection();
      store.toast(`Imported ${file.name}`, "success");
    } catch (e) {
      store.toast(`Import failed: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setHover(true);
        }}
        onDragLeave={() => setHover(false)}
        onDrop={(e) => {
          e.preventDefault();
          setHover(false);
          handleFiles(e.dataTransfer.files);
        }}
        className="mb-3 flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-3 py-7 text-center"
        style={{
          borderColor: hover ? "var(--accent)" : "var(--border)",
          background: hover ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent",
        }}
      >
        {loading ? (
          <Loader2 size={22} className="animate-spin" style={{ color: "var(--accent)" }} />
        ) : (
          <ImagePlus size={22} style={{ color: "var(--text-dim)" }} />
        )}
        <p className="text-[11px] font-semibold">Click or drop a logo</p>
        <p className="text-[10px]" style={{ color: "var(--text-dim)" }}>
          PNG · JPG · SVG (vectors stay editable)
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <Toggle
        label="Auto stamp filter"
        checked={autoFilter}
        onChange={setAutoFilter}
      />
      <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
        The stamp filter converts bitmaps to grayscale, boosts contrast and knocks
        out the background so logos print like real rubber ink.
      </p>
    </div>
  );
}
