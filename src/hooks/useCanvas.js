import { useEffect } from "react";
import useStampStore from "../store/useStampStore";
import { CANVAS_SIZE, initCanvas, styleSelection } from "../utils/canvas";
import { preloadDefaults } from "../utils/fonts";
import { loadTemplate } from "../utils/actions";
import { getDesigns, readAutosave, getPrefs, setPrefs } from "../utils/storage";

/** Mounts the fabric canvas, wires events and runs first-run bootstrapping. */
export default function useCanvas(elRef) {
  useEffect(() => {
    if (!elRef.current) return;
    const store = useStampStore.getState();
    const canvas = initCanvas(elRef.current);
    styleSelection(canvas);

    canvas.on("object:added", () => store.commit());
    canvas.on("object:removed", () => store.commit());
    canvas.on("object:modified", () => {
      store.commit();
      store.touchSelection();
    });
    canvas.on("text:changed", () => store.touchSelection());
    canvas.on("text:editing:exited", () => store.commit());
    canvas.on("selection:created", () => store.syncSelection());
    canvas.on("selection:updated", () => store.syncSelection());
    canvas.on("selection:cleared", () => store.syncSelection());

    store.setCanvas(canvas);

    let cancelled = false;
    (async () => {
      await preloadDefaults();
      if (cancelled) return;
      const autosave = readAutosave();
      const designs = getDesigns();
      const prefs = getPrefs();

      if (autosave && autosave.json && (autosave.json.objects || []).length) {
        store.toast("Restoring your last session…", "info");
        await store.restoreAutosave();
      } else if (!designs.length) {
        loadTemplate("classicRound");
        store.toast(
          prefs.visited
            ? "Starter template loaded"
            : "Welcome to Stampcraft — start from a template or build your own!",
          "success"
        );
        store.setPulseTemplates(true);
        setTimeout(() => useStampStore.getState().setPulseTemplates(false), 9000);
      } else {
        loadTemplate("classicRound");
      }
      setPrefs({ visited: true });
      store.resetHistory();
      store.applyTheme(store.theme);
      canvas.requestRenderAll();
    })();

    return () => {
      cancelled = true;
      canvas.dispose();
      useStampStore.getState().setCanvas(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export { CANVAS_SIZE };
