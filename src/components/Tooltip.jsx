import { useEffect, useRef, useState } from "react";

const GAP = 14;
const FALLBACK_W = 140;
const FALLBACK_H = 28;

export default function Tooltip({
  label,
  hint,
  shortcut,
  side = "top-right",
  delay = 80,
  className = "",
  children,
}) {
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ left: 0, top: 0 });

  const placeNearCursor = () => {
    const mx = mouseRef.current.x;
    const my = mouseRef.current.y;
    const tip = tooltipRef.current;
    const w = tip?.offsetWidth || FALLBACK_W;
    const h = tip?.offsetHeight || FALLBACK_H;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = mx + GAP;
    let top = my + GAP;

    if (left + w > vw - 8) left = mx - w - GAP;
    if (top + h > vh - 8) top = my - h - GAP;
    if (left < 8) left = 8;
    if (top < 8) top = 8;

    setCoords({ left, top });
  };

  const show = (e) => {
    if (e?.clientX) mouseRef.current = { x: e.clientX, y: e.clientY };
    else if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      mouseRef.current = { x: r.right, y: r.top };
    }
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      placeNearCursor();
      setVisible(true);
    }, delay);
  };

  const hide = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  const onMove = (e) => {
    mouseRef.current = { x: e.clientX, y: e.clientY };
    if (visible) placeNearCursor();
  };

  useEffect(() => {
    if (!visible) return;
    placeNearCursor();
  }, [visible]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  if (!label && !hint && !shortcut) {
    return children;
  }

  const resolvedShortcut = shortcut || (hint && hint.startsWith("Ctrl") ? hint : null);
  const resolvedHint = resolvedShortcut === hint ? null : hint;

  return (
    <span
      ref={triggerRef}
      className={`relative inline-flex ${className}`.trim()}
      onMouseEnter={show}
      onMouseLeave={hide}
      onMouseMove={onMove}
      onFocus={show}
      onBlur={hide}
      onMouseDown={hide}
    >
      {children}
      {visible && (
        <span
          ref={tooltipRef}
          role="tooltip"
          className="toast-in pointer-events-none fixed z-[100] flex items-center gap-1 border px-1.5 py-0.5 text-[10px] font-medium leading-none"
          style={{
            left: coords.left,
            top: coords.top,
            background: "var(--bg-panel)",
            borderColor: "var(--border-soft)",
            color: "var(--text-dim)",
          }}
        >
          <span className="truncate tracking-tight">{label}</span>
          {resolvedHint && (
            <span className="text-[9px] font-normal" style={{ color: "var(--text-mute)" }}>
              {resolvedHint}
            </span>
          )}
          {resolvedShortcut && (
            <kbd
              className="inline-flex items-center border px-1 py-px font-mono text-[9px] font-semibold"
              style={{ borderColor: "var(--border-soft)", background: "var(--bg-sunken)", color: "var(--text-mute)" }}
            >
              {resolvedShortcut}
            </kbd>
          )}
        </span>
      )}
    </span>
  );
}
