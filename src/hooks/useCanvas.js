import { useEffect } from "react";
import useStampStore from "../store/useStampStore";
import { CANVAS_SIZE, initCanvas, styleSelection } from "../utils/canvas";
import { preloadDefaults, restoreCustomFonts } from "../utils/fonts";
import { loadTemplate } from "../utils/actions";
import { getDesigns, readAutosave, getPrefs, setPrefs } from "../utils/storage";

/** Mounts the fabric canvas, wires events and runs first-run bootstrapping. */
export default function useCanvas(elRef) {
  useEffect(() => {
    if (!elRef.current) return;
    const store = useStampStore.getState();
    const canvas = initCanvas(elRef.current, {
      selectionColor: store.selectionColor,
      selectionBorderWidth: store.selectionBorderWidth,
    });
    styleSelection(canvas, store.selectionColor);

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
    canvas.on("mouse:down", (e) => {
      if (e.target) return;
      if (canvas.getActiveObject()) {
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        store.syncSelection();
      }
    });

    store.setCanvas(canvas);

    let cancelled = false;
    (async () => {
      // Never let font loading stall the first paint: if Google Fonts is
      // slow, blocked, or offline, carry on after 1.5s and let text swap
      // in when the fonts arrive.
      const timeout = (ms) => new Promise((r) => setTimeout(r, ms));
      await Promise.race([
        (async () => {
          await preloadDefaults();
          await restoreCustomFonts().catch(() => null);
        })(),
        timeout(1500),
      ]);
      if (cancelled) return;
      const autosave = readAutosave();
      const designs = getDesigns();
      const prefs = getPrefs();

      if (autosave && autosave.json && (autosave.json.objects || []).length) {
        await store.restoreAutosave();
        store.refreshFields();
      } else if (!designs.length) {
        loadTemplate("classicRound", { silent: true });
        store.toast(
          prefs.visited ? "Starter template loaded" : "Welcome to Stampcraft",
          "success"
        );
        store.setPulseTemplates(true);
        setTimeout(() => useStampStore.getState().setPulseTemplates(false), 9000);
      } else {
        loadTemplate("classicRound", { silent: true });
      }
      setPrefs({ visited: true });
      // Re-apply the saved stamp surface colour (templates/JSON may reset it).
      const saved = useStampStore.getState().canvasColor;
      canvas.backgroundColor = saved || undefined;
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
