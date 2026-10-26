const C = 310;

export default {
  id: "serialStamp",
  name: "Serial No.",
  tags: ["serial", "office"],
  build: () => [
    { type: "rect", w: 470, h: 220, rx: 4, cx: C, cy: C, strokeWidth: 8, name: "Border" },
    { type: "text", text: "SERIAL", fontSize: 36, cx: C, cy: C - 52, w: 420, charSpacing: 160 },
    {
      type: "text",
      text: "NO. 0001",
      field: "serial",
      serialPrefix: "NO. ",
      serialValue: 1,
      serialPad: 4,
      fontSize: 48,
      fontFamily: "Roboto Mono",
      fontWeight: "700",
      cx: C,
      cy: C + 28,
      w: 420,
      name: "Serial",
    },
  ],
};
