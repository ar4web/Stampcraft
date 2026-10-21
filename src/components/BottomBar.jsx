import useStampStore from "../store/useStampStore";

export default function BottomBar() {
  const selected = useStampStore((s) => s.selected);
  const zoom = useStampStore((s) => s.zoom);

  return (
    <footer
      className="z-[45] flex shrink-0 items-center justify-between border-t px-2.5 overflow-x-auto scroll-thin select-none"
      style={{
        height: "var(--bar-h)",
        background: "var(--bg-panel)",
        borderColor: "var(--border)",
      }}
    >
      <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-mute)" }}>
        Stampcraft
      </span>
      <span
        className="max-w-[220px] truncate text-[10px] tabular-nums"
        style={{ color: "var(--text-mute)" }}
        title={selected ? `Selected: ${selected.name || "Object"}` : "No selection"}
      >
        {selected ? (
          <span className="font-medium" style={{ color: "var(--text-dim)" }}>
            {selected.name || "Layer selected"}
          </span>
        ) : (
          "Ready"
        )}{" "}
        · {Math.round(zoom * 100)}%
      </span>
    </footer>
  );
}
