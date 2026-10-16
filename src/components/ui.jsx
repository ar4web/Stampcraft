import { useEffect, useRef, useState } from "react";
import { INK_COLORS } from "../utils/canvas";

export function Row({ label, children, className = "" }) {
  return (
    <div className={`mb-2.5 ${className}`}>
      {label && <div className="label mb-1">{label}</div>}
      {children}
    </div>
  );
}

/** Range slider with a 100ms debounce before firing the redraw callback. */
export function Slider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  suffix = "",
  debounce = 100,
}) {
  const [local, setLocal] = useState(value);
  const timer = useRef(null);
  const dragging = useRef(false);

  useEffect(() => {
    if (!dragging.current) setLocal(value);
  }, [value]);

  const handle = (v) => {
    setLocal(v);
    dragging.current = true;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      dragging.current = false;
      onChange(v);
    }, debounce);
  };

  return (
    <div className="mb-2.5">
      <div className="mb-1 flex items-center justify-between">
        <span className="label">{label}</span>
        <span className="text-[11px] tabular-nums" style={{ color: "var(--text-dim)" }}>
          {typeof local === "number" ? Math.round(local * 100) / 100 : local}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={local}
        onChange={(e) => handle(Number(e.target.value))}
        onMouseUp={() => {
          dragging.current = false;
          onChange(local);
        }}
      />
    </div>
  );
}

export function ColorField({ label = "Ink colour", value, onChange }) {
  const [hex, setHex] = useState(value || "#000000");
  useEffect(() => setHex(value || "#000000"), [value]);

  const commit = (v) => {
    setHex(v);
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) onChange(v);
  };

  return (
    <div className="mb-2.5">
      <div className="label mb-1">{label}</div>
      <div className="mb-1.5 flex flex-wrap gap-1.5">
        {INK_COLORS.map((c) => (
          <button
            key={c.hex}
            title={c.name}
            onClick={() => commit(c.hex)}
            className="h-6 w-6 rounded-md border-2"
            style={{
              background: c.hex,
              borderColor:
                (value || "").toLowerCase() === c.hex.toLowerCase()
                  ? "var(--accent)"
                  : "var(--border)",
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        <input
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(hex) ? hex : "#000000"}
          onChange={(e) => commit(e.target.value)}
          className="h-7 w-9"
        />
        <input
          className="field"
          value={hex}
          onChange={(e) => commit(e.target.value)}
          spellCheck={false}
        />
      </div>
    </div>
  );
}

export function Toggle({ label, checked, onChange }) {
  return (
    <label className="mb-2.5 flex cursor-pointer items-center justify-between gap-2">
      <span className="label">{label}</span>
      <span
        onClick={() => onChange(!checked)}
        className="relative h-5 w-9 shrink-0 rounded-full transition-colors"
        style={{ background: checked ? "var(--accent)" : "var(--border)" }}
      >
        <span
          className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all"
          style={{ left: checked ? 18 : 2 }}
        />
      </span>
    </label>
  );
}

export function SegButton({ options, value, onChange }) {
  return (
    <div
      className="mb-2.5 flex overflow-hidden rounded-lg border"
      style={{ borderColor: "var(--border)" }}
    >
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className="flex-1 px-2 py-1.5 text-[11px] font-semibold"
          style={
            value === o.value
              ? { background: "var(--accent)", color: "#fff" }
              : { color: "var(--text-dim)" }
          }
          title={o.title || o.label}
        >
          {o.icon || o.label}
        </button>
      ))}
    </div>
  );
}

export function Empty({ icon: Icon, title, hint }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      {Icon && <Icon size={28} style={{ color: "var(--text-dim)" }} />}
      <p className="text-xs font-semibold">{title}</p>
      {hint && (
        <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}
