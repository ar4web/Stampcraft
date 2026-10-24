import { useEffect } from "react";
import { Sliders, Wrench } from "lucide-react";
import TopBar from "./components/TopBar";
import LeftSidebar from "./components/LeftSidebar";
import RightPanel from "./components/RightPanel";
import CanvasArea from "./components/CanvasArea";
import ToastHost from "./components/Toast";
import SaveLoadModal from "./components/Modals/SaveLoadModal";
import DownloadModal from "./components/Modals/DownloadModal";
import BottomBar from "./components/BottomBar";
import SettingsDrawer from "./components/SettingsDrawer";
import ErrorBoundary from "./components/ErrorBoundary";
import { useIsMobile } from "./components/DraggablePanel";
import useStampStore from "./store/useStampStore";
import useKeyboard from "./hooks/useKeyboard";
import useAutoSave from "./hooks/useAutoSave";

function MobileBar() {
  const { leftOpen, rightOpen, toggleLeft, toggleRight } = useStampStore();
  return (
    <nav
      className="z-[60] flex shrink-0 items-center justify-around border-t md:hidden"
      style={{ height: "var(--bar-h)", background: "var(--bg-panel)", borderColor: "var(--border)" }}
    >
      <button
        type="button"
        className="btn btn-ghost flex-1"
        aria-pressed={leftOpen}
        onClick={toggleLeft}
        style={leftOpen ? { color: "var(--accent)" } : undefined}
      >
        <Wrench size={16} /> Tools
      </button>
      <button
        type="button"
        className="btn btn-ghost flex-1"
        aria-pressed={rightOpen}
        onClick={toggleRight}
        style={rightOpen ? { color: "var(--accent)" } : undefined}
      >
        <Sliders size={16} /> Properties
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
    useStampStore.getState().applyPersonalisation();
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      const t = useStampStore.getState().theme;
      if (t === "system") applyTheme("system");
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
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
   <ErrorBoundary>
    <div className="flex h-full w-full flex-col overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <a href="#canvas-workspace" className="skip-link">Skip to canvas</a>
      <TopBar />
      {/* consistent 8px gutters between the three work regions */}
      <div
        className="relative flex min-h-0 flex-1 gap-2 p-2"
        style={{ background: "var(--bg-primary)" }}
      >
        <LeftSidebar />
        <CanvasArea />
        <RightPanel />
      </div>
      <BottomBar />
      <MobileBar />

      <ToastHost />
      <SettingsDrawer />
      {modal === "saveload" && <SaveLoadModal />}
      {modal === "download" && <DownloadModal />}
    </div>
   </ErrorBoundary>
  );
}
