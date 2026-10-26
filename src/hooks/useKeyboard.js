import { useEffect } from "react";
import useStampStore from "../store/useStampStore";
import {
  bringForward,
  clearCanvas,
  deleteSelection,
  doExportPNG,
  duplicateSelection,
  groupSelection,
  nudge,
  selectAll,
  sendBackwards,
  ungroupSelection,
} from "../utils/actions";

const isTyping = (t) =>
  t &&
  (t.tagName === "INPUT" ||
    t.tagName === "TEXTAREA" ||
    t.isContentEditable ||
    t.tagName === "SELECT");

/** Global workspace hotkeys. */
export default function useKeyboard() {
  useEffect(() => {
    const onKey = (e) => {
      const store = useStampStore.getState();
      const canvas = store.canvas;
      if (isTyping(e.target)) return;
      if (canvas && canvas.getActiveObject()?.isEditing) return;

      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (mod) {
        switch (key) {
          case "z":
            e.preventDefault();
            e.shiftKey ? store.redo() : store.undo();
            return;
          case "y":
            e.preventDefault();
            store.redo();
            return;
          case "d":
            e.preventDefault();
            duplicateSelection();
            return;
          case "s":
            e.preventDefault();
            if (e.shiftKey) store.exportStampFile();
            else store.saveCurrent();
            return;
          case "e":
            e.preventDefault();
            doExportPNG(3);
            return;
          case "n":
            e.preventDefault();
            clearCanvas();
            return;
          case "a":
            e.preventDefault();
            selectAll();
            return;
          case "k":
            e.preventDefault();
            store.toggleSettings();
            return;
          case "g":
            e.preventDefault();
            e.shiftKey ? ungroupSelection() : groupSelection();
            return;
          case "[":
            e.preventDefault();
            sendBackwards();
            return;
          case "]":
            e.preventDefault();
            bringForward();
            return;
          default:
            return;
        }
      }

      if (key === "delete" || key === "backspace") {
        e.preventDefault();
        deleteSelection();
        return;
      }
      if (key === "escape") {
        canvas?.discardActiveObject();
        canvas?.requestRenderAll();
        store.syncSelection();
        return;
      }
      const step = e.shiftKey ? 10 : 1;
      const map = {
        arrowleft: [-step, 0],
        arrowright: [step, 0],
        arrowup: [0, -step],
        arrowdown: [0, step],
      };
      if (map[key]) {
        e.preventDefault();
        nudge(...map[key]);
      }
    };

    const onKeyUpCommit = (e) => {
      if (e.key.startsWith("Arrow") && !isTyping(e.target))
        useStampStore.getState().commit();
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUpCommit);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKeyUpCommit);
    };
  }, []);
}
