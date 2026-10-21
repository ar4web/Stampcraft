import useStampStore from "../../store/useStampStore";
import Tooltip from "../Tooltip";

function hexOr(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
}

function Picker({ label, value, fallback, onChange }) {
  const hex = hexOr(value, fallback);
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1.5">
      <span className="label shrink-0">{label}</span>
      <Tooltip label={label} hint={hex} side="top">
        <label
          className="relative h-7 w-7 shrink-0 cursor-pointer border"
          style={{ background: hex, borderColor: "var(--border-soft)" }}
        >
          <input
            type="color"
            value={hex}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label={label}
          />
        </label>
      </Tooltip>
    </div>
  );
}

export default function SurfacePanel() {
  const inkColor = useStampStore((s) => s.inkColor);
  const setInkColor = useStampStore((s) => s.setInkColor);
  const canvasColor = useStampStore((s) => s.canvasColor);
  const setCanvasColor = useStampStore((s) => s.setCanvasColor);
  const workspaceColor = useStampStore((s) => s.workspaceColor);
  const setWorkspaceColor = useStampStore((s) => s.setWorkspaceColor);

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Picker label="Ink" value={inkColor} fallback="#003399" onChange={setInkColor} />
      <Picker label="Paper" value={canvasColor} fallback="#ffffff" onChange={setCanvasColor} />
      <Picker label="Desk" value={workspaceColor} fallback="#121314" onChange={setWorkspaceColor} />
    </div>
  );
}
