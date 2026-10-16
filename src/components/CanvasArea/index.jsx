import { useEffect, useRef, useState } from "react";
import useStampStore from "../../store/useStampStore";
import useCanvas from "../../hooks/useCanvas";
import { CANVAS_SIZE, addImageFromFile } from "../../utils/canvas";
import ZoomControls from "./ZoomControls";
import Rulers from "./Rulers";

export default function CanvasArea() {
  const elRef = useRef(null);
  const scrollRef = useRef(null);
  const [dropping, setDropping] = useState(false);
  const [panning, setPanning] = useState(false);
  const zoom = useStampStore((s) => s.zoom);
  const showRulers = useStampStore((s) => s.showRulers);
  const showGrid = useStampStore((s) => s.showGrid);

  useCanvas(elRef);

  /* wheel zoom + spacebar pan */
  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    const onWheel = (e) => {
      if (e.shiftKey) return;
      e.preventDefault();
      const store = useStampStore.getState();
      store.setZoom(store.zoom + (e.deltaY > 0 ? -0.1 : 0.1));
    };
    node.addEventListener("wheel", onWheel, { passive: false });

    let space = false;
    let drag = null;
    const down = (e) => {
      if (e.code === "Space" && !space) {
        const t = e.target;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
        space = true;
        setPanning(true);
        e.preventDefault();
      }
    };
    const up = (e) => {
      if (e.code === "Space") {
        space = false;
        setPanning(false);
      }
    };
    const mdown = (e) => {
      if (!space) return;
      drag = { x: e.clientX, y: e.clientY, l: node.scrollLeft, t: node.scrollTop };
      e.preventDefault();
      e.stopPropagation();
    };
    const mmove = (e) => {
      if (!drag) return;
      node.scrollLeft = drag.l - (e.clientX - drag.x);
      node.scrollTop = drag.t - (e.clientY - drag.y);
    };
    const mup = () => (drag = null);

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    node.addEventListener("mousedown", mdown, true);
    window.addEventListener("mousemove", mmove);
    window.addEventListener("mouseup", mup);
    return () => {
      node.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      node.removeEventListener("mousedown", mdown, true);
      window.removeEventListener("mousemove", mmove);
      window.removeEventListener("mouseup", mup);
    };
  }, []);

  const onDrop = async (e) => {
    e.preventDefault();
    setDropping(false);
    const store = useStampStore.getState();
    const file = e.dataTransfer.files?.[0];
    if (!file || !store.canvas) return;
    try {
      await addImageFromFile(store.canvas, file);
      store.commit();
      store.syncSelection();
      store.toast(`Imported ${file.name}`, "success");
    } catch (err) {
      store.toast(`Import failed: ${err.message}`, "error");
    }
  };

  return (
    <main
      ref={scrollRef}
      onDragOver={(e) => {
        e.preventDefault();
        setDropping(true);
      }}
      onDragLeave={() => setDropping(false)}
      onDrop={onDrop}
      className="checkerboard scroll-thin relative flex-1 overflow-auto"
      style={{ cursor: panning ? "grab" : "default" }}
    >
      <div className="flex min-h-full min-w-full items-center justify-center p-10 sm:p-14">
        <div className="relative">
          {showRulers && <Rulers zoom={zoom} />}
          <div
            className="relative shadow-2xl"
            style={{
              outline: "1px solid var(--border)",
              background:
                "repeating-conic-gradient(rgba(255,255,255,0.045) 0% 25%, transparent 0% 50%)",
              backgroundSize: "16px 16px",
            }}
          >
            <canvas ref={elRef} width={CANVAS_SIZE} height={CANVAS_SIZE} />
            {showGrid && (
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(99,102,241,.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,.25) 1px, transparent 1px)",
                  backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {dropping && (
        <div
          className="pointer-events-none absolute inset-0 z-30 grid place-items-center border-2 border-dashed"
          style={{
            borderColor: "var(--accent)",
            background: "color-mix(in srgb, var(--accent) 12%, transparent)",
          }}
        >
          <p className="rounded-lg px-4 py-2 text-sm font-semibold" style={{ background: "var(--bg-panel)" }}>
            Drop image or SVG to place on the stamp
          </p>
        </div>
      )}

      <ZoomControls />
    </main>
  );
}
