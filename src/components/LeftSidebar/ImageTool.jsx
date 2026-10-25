import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { addImageFromFile, applyStampFilter, clipObjectToRing } from "../../utils/canvas";
import { removeImageBackground } from "../../utils/image";
import { Checkbox } from "../ui";

export default function ImageTool() {
  const inputRef = useRef(null);
  const [hover, setHover] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoFilter, setAutoFilter] = useState(true);
  const [fitRing, setFitRing] = useState(true);
  const [knockout, setKnockout] = useState(true);
  const company = useStampStore((s) => s.company);

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
      if (knockout && obj.type === "image") {
        await removeImageBackground(store.canvas, obj);
      }
      if (autoFilter && obj.type === "image") {
        await applyStampFilter(store.canvas, obj, true);
      }
      if (fitRing) {
        try {
          await clipObjectToRing(store.canvas, obj);
        } catch (err) {
          store.toast(err.message, "info");
        }
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
      <button
        type="button"
        aria-label="Upload a logo image"
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
        className="mb-3 flex w-full cursor-pointer flex-col items-center gap-2 border-2 border-dashed px-3 py-7 text-center"
        style={{
          borderColor: hover ? "var(--accent)" : "var(--border-soft)",
          background: hover ? "var(--bg-btn-hover)" : "var(--bg-sunken)",
        }}
      >
        {loading ? (
          <Loader2 size={22} className="animate-spin" style={{ color: "var(--accent)" }} />
        ) : (
          <ImagePlus size={22} style={{ color: "var(--text-dim)" }} />
        )}
        <p className="text-[13px] font-semibold">Click or drop a logo</p>
        <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
          PNG · JPG · SVG (vectors stay editable)
        </p>
      </button>

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

      {company?.logo ? (
        <button
          type="button"
          className="btn w-full mb-3"
          onClick={async () => {
            const store = useStampStore.getState();
            try {
              const blob = await (await fetch(company.logo)).blob();
              const file = new File([blob], "company-logo.png", { type: blob.type || "image/png" });
              await handleFiles([file]);
            } catch (e) {
              store.toast(e.message, "error");
            }
          }}
        >
          Use company logo
        </button>
      ) : null}

      <Checkbox
        label="Auto stamp filter"
        checked={autoFilter}
        onChange={setAutoFilter}
      />
      <Checkbox
        label="Remove background"
        checked={knockout}
        onChange={setKnockout}
        hint="Knocks out the paper/white backdrop on import."
      />
      <Checkbox
        label="Fit and clip to frame"
        checked={fitRing}
        onChange={setFitRing}
        hint="Centers the logo in the outer ring and knocks out overflow."
      />
      <p className="text-[12px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
        The stamp filter converts bitmaps to grayscale, boosts contrast and knocks
        out the background so logos print like real rubber ink.
      </p>
    </div>
  );
}
