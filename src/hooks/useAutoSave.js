import { useEffect, useRef } from "react";
import useStampStore from "../store/useStampStore";
import { serialize } from "../utils/canvas";
import { writeAutosave } from "../utils/storage";

/** Debounced (2s) autosave of the working canvas into localStorage. */
export default function useAutoSave(delay = 2000) {
  const timer = useRef(null);

  useEffect(() => {
    const unsub = useStampStore.subscribe((state, prev) => {
      if (state.layerVersion === prev.layerVersion && state.selVersion === prev.selVersion)
        return;
      const canvas = state.canvas;
      if (!canvas) return;
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        try {
          writeAutosave(serialize(canvas));
        } catch (e) {
          console.warn("autosave failed", e);
        }
      }, delay);
    });
    return () => {
      clearTimeout(timer.current);
      unsub();
    };
  }, [delay]);
}
