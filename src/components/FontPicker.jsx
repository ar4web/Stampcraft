import { FONT_SETS } from "../utils/fonts";

const SAMPLE = {
  Latin: "Aa",
  Cyrillic: "Аа",
  Arabic: "أب",
  CJK: "字",
  Devanagari: "अ",
  Thai: "กข",
};

const SCRIPT_OF = Object.fromEntries(
  FONT_SETS.flatMap((g) => g.fonts.map((f) => [f, g.script]))
);

export function fontSample(family) {
  return SAMPLE[SCRIPT_OF[family]] || "Aa";
}

export function FontTile({ family, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`font-tile ${selected ? "is-on" : ""}`}
      aria-pressed={selected}
      aria-label={family}
      title={family}
      onClick={() => onSelect(family)}
    >
      <span className="font-tile-sample" style={{ fontFamily: family }} aria-hidden>
        {fontSample(family)}
      </span>
      <span className="font-tile-name">{family}</span>
    </button>
  );
}

export default function FontPicker({ fonts, value, onSelect, grouped }) {
  if (grouped) {
    const custom = fonts.filter((f) => !SCRIPT_OF[f]);
    return (
      <div className="space-y-2">
        {custom.length > 0 && (
          <div>
            <p className="label mb-1">Uploaded</p>
            <div className="font-grid">
              {custom.map((f) => (
                <FontTile key={f} family={f} selected={value === f} onSelect={onSelect} />
              ))}
            </div>
          </div>
        )}
        {FONT_SETS.map((g) => {
          const items = g.fonts.filter((f) => fonts.includes(f));
          if (!items.length) return null;
          return (
            <div key={g.script}>
              <p className="label mb-1">{g.script}</p>
              <div className="font-grid">
                {items.map((f) => (
                  <FontTile key={f} family={f} selected={value === f} onSelect={onSelect} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="font-grid">
      {fonts.map((f) => (
        <FontTile key={f} family={f} selected={value === f} onSelect={onSelect} />
      ))}
    </div>
  );
}
