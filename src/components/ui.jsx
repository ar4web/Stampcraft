import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const round = (v, step) => {
  const d = (String(step).split(".")[1] || "").length;
  return Number(v.toFixed(d));
};

export function Row({ label, hint, children, className = "" }) {
  return (
    <div className={`mb-2 min-w-0 ${className}`}>
      {label && (
        <div className="mb-1.5 flex h-4 items-center justify-between gap-2">
          <span className="label">{label}</span>
          {hint && (
            <span className="shrink-0 text-[9px] font-medium" style={{ color: "var(--text-mute)" }}>
              {hint}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export function Fold({ title, hint, open = true, children }) {
  const [on, setOn] = useState(open);
  return (
    <section className="fold">
      <button
        type="button"
        className={`fold-head ${on ? "is-open" : ""}`}
        aria-expanded={on}
        onClick={() => setOn((v) => !v)}
      >
        <span className="label">{title}</span>
        <span className="fold-meta">
          {hint && <span className="fold-hint">{hint}</span>}
          {on ? <ChevronUp size={12} aria-hidden /> : <ChevronDown size={12} aria-hidden />}
        </span>
      </button>
      {on && <div className="fold-body">{children}</div>}
    </section>
  );
}

/** Square checkbox matching the design system. */
export function Checkbox({ label, checked, onChange, hint }) {
  return (
    <div className="mb-3">
      <button
        type="button"
        role="checkbox"
        aria-checked={!!checked}
        onClick={() => onChange(!checked)}
        className="flex min-h-8 w-full items-center gap-2.5 text-left"
      >
        <span
          className="grid h-5 w-5 shrink-0 place-items-center border"
          style={{
            background: checked ? "var(--accent)" : "var(--bg-sunken)",
            borderColor: checked ? "var(--accent)" : "var(--border-soft)",
          }}
        >
            {checked && <Check size={12} color="var(--on-accent)" strokeWidth={3} aria-hidden />}
        </span>
        <span className="text-[11px] font-medium leading-snug">{label}</span>
      </button>
      {hint && (
        <p className="mt-1 pl-8 text-[10px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

/** Narrow value box (20% of the row) with two small stacked arrows. */
function MicroNumber({ value, min, max, step, onChange, suffix, "aria-label": ariaLabel }) {
  const [draft, setDraft] = useState(String(value ?? ""));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setDraft(String(value ?? ""));
  }, [value]);

  const commit = (raw) => {
    const n = parseFloat(raw);
    if (Number.isNaN(n)) return setDraft(String(value ?? ""));
    const next = round(clamp(n, min, max), step);
    setDraft(String(next));
    onChange(next);
  };

  const bump = (dir, e) => {
    const mult = e?.shiftKey ? 10 : 1;
    const next = round(clamp((Number(value) || 0) + dir * step * mult, min, max), step);
    setDraft(String(next));
    onChange(next);
  };

  return (
    <div
      className="flex shrink-0 items-stretch self-stretch overflow-hidden border"
      style={{
        width: 52,
        background: "var(--bg-sunken)",
        borderColor: "var(--border-soft)",
      }}
    >
      <input
        type="number"
        aria-label={ariaLabel}
        className="min-w-0 flex-1 bg-transparent px-1 text-center text-[10px] font-medium tabular-nums outline-none"
        style={{ color: "var(--text)" }}
        value={draft}
        step={step}
        onFocus={() => (focused.current = true)}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => {
          focused.current = false;
          commit(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            commit(e.currentTarget.value);
            e.currentTarget.blur();
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            bump(1, e);
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            bump(-1, e);
          }
        }}
        title={suffix ? `Value in ${suffix}` : undefined}
      />
      <span className="micro-stepper">
        <button type="button" tabIndex={-1} aria-label="Increase" onClick={(e) => bump(1, e)}>
          <ChevronUp size={9} />
        </button>
        <button type="button" tabIndex={-1} aria-label="Decrease" onClick={(e) => bump(-1, e)}>
          <ChevronDown size={9} />
        </button>
      </span>
    </div>
  );
}

/**
 * 80% slider track + 20% value box on one line.
 * Dragging is debounced (100ms); typing and stepping apply immediately.
 */
export function Slider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  suffix = "",
  debounce = 60,
}) {
  const [local, setLocal] = useState(value);
  const timer = useRef(null);
  const dragging = useRef(false);

  useEffect(() => {
    if (!dragging.current) setLocal(value);
  }, [value]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const drag = (v) => {
    setLocal(v);
    dragging.current = true;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      dragging.current = false;
      onChange(v);
    }, debounce);
  };

  const set = (v) => {
    clearTimeout(timer.current);
    dragging.current = false;
    setLocal(v);
    onChange(v);
  };

  return (
    <div className="slider-row">
      <label className="label" title={label}>
        {label}
      </label>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={local}
        onChange={(e) => drag(Number(e.target.value))}
        onMouseUp={() => set(local)}
        onTouchEnd={() => set(local)}
      />
      <MicroNumber
        value={local}
        min={min}
        max={max}
        step={step}
        onChange={set}
        suffix={suffix}
        aria-label={label}
      />
    </div>
  );
}

export function SegButton({ options, value, onChange, label }) {
  return (
    <div className="mb-3">
      {label && <div className="label mb-1.5">{label}</div>}
      <div
        className="flex border"
        style={{ borderColor: "var(--border-soft)", background: "var(--bg-sunken)" }}
        role="tablist"
      >
        {options.map((o, i) => {
          const on = value === o.value;
          return (
            <button
              type="button"
              key={o.value}
              role="tab"
              aria-selected={on}
              onClick={() => onChange(o.value)}
              title={o.title || o.label}
              className="flex flex-1 items-center justify-center gap-1 px-2 text-[10px] font-semibold"
              style={{
                minHeight: "var(--ctl-h)",
                background: on ? "var(--accent)" : "transparent",
                color: on ? "var(--on-accent)" : "var(--text-dim)",
                borderLeft: i ? "1px solid var(--border-soft)" : "none",
              }}
            >
              {o.icon || o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Empty({ icon: Icon, title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-5 py-10 text-center">
      {Icon && <Icon size={24} style={{ color: "var(--text-dim)" }} />}
      <p className="text-[12px] font-semibold">{title}</p>
      {hint && (
        <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}
