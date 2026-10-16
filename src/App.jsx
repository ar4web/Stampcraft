import { useEffect } from "react";
import { Sliders, Wrench } from "lucide-react";
import TopBar from "./components/TopBar";
import LeftSidebar from "./components/LeftSidebar";
import RightPanel from "./components/RightPanel";
import CanvasArea from "./components/CanvasArea";
import ToastHost from "./components/Toast";
import SaveLoadModal from "./components/Modals/SaveLoadModal";
import TemplateModal from "./components/Modals/TemplateModal";
import ExportModal from "./components/Modals/ExportModal";
import { useIsMobile } from "./components/DraggablePanel";
import useStampStore from "./store/useStampStore";
import useKeyboard from "./hooks/useKeyboard";
import useAutoSave from "./hooks/useAutoSave";

function MobileBar() {
  const { leftOpen, rightOpen, toggleLeft, toggleRight } = useStampStore();
  return (
    <nav
      className="z-[60] flex h-12 shrink-0 items-center justify-around border-t md:hidden"
      style={{ background: "var(--bg-panel)", borderColor: "var(--border)" }}
    >
      <button
        className="btn !border-0 flex-1"
        onClick={toggleLeft}
        style={leftOpen ? { color: "var(--accent)" } : undefined}
      >
        <Wrench size={15} /> Tools
      </button>
      <button
        className="btn !border-0 flex-1"
        onClick={toggleRight}
        style={rightOpen ? { color: "var(--accent)" } : undefined}
      >
        <Sliders size={15} /> Properties
      </button>
    </nav>
  );
}

export default function App() {
  const modal = useStampStore((s) => s.modal);
  const theme = useStampStore((s) => s.theme);
  const applyTheme = useStampStore((s) => s.applyTheme);
  const mobile = useIsMobile();

  useKeyboard();
  useAutoSave(2000);

  useEffect(() => {
    applyTheme(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mobile) return;
    const store = useStampStore.getState();
    if (store.leftOpen) store.toggleLeft();
    if (store.rightOpen) store.toggleRight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobile]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <TopBar />
      <div className="relative flex min-h-0 flex-1">
        <LeftSidebar />
        <CanvasArea />
        <RightPanel />
      </div>
      <MobileBar />

      <ToastHost />
      {modal === "saveload" && <SaveLoadModal />}
      {modal === "template" && <TemplateModal />}
      {modal === "export" && <ExportModal />}
    </div>
  );
}
