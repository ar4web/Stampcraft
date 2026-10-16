const C = 310;

export default {
  id: "approvedCircle",
  name: "Approved Circle",
  tags: ["round", "approval"],
  build: () => [
    { type: "circle", r: 240, cx: C, cy: C, strokeWidth: 10, name: "Ring" },
    { type: "text", text: "APPROVED", fontSize: 72, cx: C, cy: C - 18, w: 460, charSpacing: 40 },
    { type: "line", x1: C - 150, y1: C + 34, x2: C + 150, y2: C + 34, strokeWidth: 4 },
    {
      type: "text",
      text: "DATE  ___ / ___ / ______",
      fontSize: 26,
      fontFamily: "Roboto Mono",
      fontWeight: "400",
      cx: C,
      cy: C + 76,
      w: 420,
    },
  ],
};
