import { Plus, RefreshCw } from "lucide-react";
import useStampStore from "../../store/useStampStore";
import { CANVAS_SIZE, createSpecObject } from "../../utils/canvas";
import { addObject } from "../../utils/actions";
import { DATE_FORMATS, fieldText } from "../../utils/fields";
import { Row } from "../ui";

const C = CANVAS_SIZE / 2;

const KINDS = [
  { id: "date", label: "Today", format: "DD MMM YYYY" },
  { id: "time", label: "Time" },
  { id: "datetime", label: "Date + time", format: "DD MMM YYYY" },
  { id: "serial", label: "Serial", serialPrefix: "NO. ", serialValue: 1, serialPad: 4 },
];

export default function FieldTool() {
  const ink = useStampStore((s) => s.inkColor);
  const toast = useStampStore((s) => s.toast);
  const refreshFields = useStampStore((s) => s.refreshFields);

  const drop = (kind) => {
    const meta = {
      field: kind.id,
      dateFormat: kind.format || "DD MMM YYYY",
      serialPrefix: kind.serialPrefix ?? "NO. ",
      serialValue: kind.serialValue ?? 1,
      serialPad: kind.serialPad ?? 4,
    };
    const text = fieldText(meta);
    addObject(
      createSpecObject({
        type: "text",
        text,
        field: kind.id,
        dateFormat: meta.dateFormat,
        serialPrefix: meta.serialPrefix,
        serialValue: meta.serialValue,
        serialPad: meta.serialPad,
        fontSize: kind.id === "serial" ? 44 : 36,
        fontFamily: "Roboto Mono",
        fontWeight: "700",
        fill: ink,
        charSpacing: 20,
        cx: C,
        cy: C,
        w: 420,
        name: kind.label,
      })
    );
    toast(`Added live ${kind.label.toLowerCase()}`, "success");
  };

  return (
    <div className="space-y-2.5">
      <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-dim)" }}>
        Live values. Date and time update on load and export. Serial bumps after each print.
      </p>
      <Row label="Insert">
        <div className="grid grid-cols-2 gap-1.5">
          {KINDS.map((k) => (
            <button key={k.id} type="button" className="btn !px-1 text-[10px] font-semibold" onClick={() => drop(k)}>
              <Plus size={11} aria-hidden /> {k.label}
            </button>
          ))}
        </div>
      </Row>
      <Row label="Date style">
        <div className="flex flex-wrap gap-1">
          {DATE_FORMATS.map((f) => (
            <button
              key={f.id}
              type="button"
              className="btn !min-h-6 !px-1.5 text-[9px]"
              onClick={() => drop({ id: "date", label: "Today", format: f.id })}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Row>
      <button type="button" className="btn w-full" onClick={() => refreshFields()}>
        <RefreshCw size={13} aria-hidden /> Refresh now
      </button>
    </div>
  );
}
