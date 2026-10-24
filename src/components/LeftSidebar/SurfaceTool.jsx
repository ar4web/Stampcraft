import useStampStore from "../../store/useStampStore";
import Tooltip from "../Tooltip";

function hexOr(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
}

function RailPicker({ label, value, fallback, onChange }) {
  const hex = hexOr(value, fallback);
  return (
    <Tooltip label={label} hint={hex} side="right" className="w-full">
      <label className="rail-btn cursor-pointer" aria-label={label}>
        <span
          className="relative block h-[18px] w-[18px] border"
          style={{ background: hex, borderColor: "var(--border-soft)" }}
        >
          <input
            type="color"
            value={hex}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label={label}
          />
        </span>
        <span className="sr-only">{label}</span>
      </label>
    </Tooltip>
  );
}

export default function SurfaceTool({ compact = false }) {
  const inkColor = useStampStore((s) => s.inkColor);
  const setInkColor = useStampStore((s) => s.setInkColor);
  const canvasColor = useStampStore((s) => s.canvasColor);
  const setCanvasColor = useStampStore((s) => s.setCanvasColor);
  const workspaceColor = useStampStore((s) => s.workspaceColor);
  const setWorkspaceColor = useStampStore((s) => s.setWorkspaceColor);

  const pickers = (
    <>
      <RailPicker label="Ink" value={inkColor} fallback="#003399" onChange={setInkColor} />
      <RailPicker label="Paper" value={canvasColor} fallback="#ffffff" onChange={setCanvasColor} />
      <RailPicker label="Desk" value={workspaceColor} fallback="#121314" onChange={setWorkspaceColor} />
    </>
  );

  if (compact) {
    return <div className="flex w-full flex-col">{pickers}</div>;
  }

  return <div className="flex items-stretch justify-around">{pickers}</div>;
}
