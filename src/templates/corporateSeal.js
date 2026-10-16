const C = 310;

export default {
  id: "corporateSeal",
  name: "Corporate Seal",
  tags: ["seal", "arc", "star"],
  build: () => [
    { type: "circle", r: 252, cx: C, cy: C, strokeWidth: 6 },
    { type: "circle", r: 238, cx: C, cy: C, strokeWidth: 2 },
    { type: "circle", r: 170, cx: C, cy: C, strokeWidth: 2 },
    {
      type: "arc",
      text: "MERIDIAN HOLDINGS INC.",
      radius: 206,
      position: "top",
      fontSize: 34,
      letterSpacing: 3,
      cx: C,
      cy: C,
    },
    {
      type: "arc",
      text: "• CORPORATE SEAL •",
      radius: 206,
      position: "bottom",
      fontSize: 26,
      letterSpacing: 4,
      cx: C,
      cy: C,
    },
    { type: "star", outer: 46, inner: 19, points: 5, cx: C, cy: C - 78, fill: "#000000", strokeWidth: 0, name: "Star" },
    { type: "text", text: "128 HARBOUR ROAD", fontSize: 22, fontFamily: "Inter", fontWeight: "600", cx: C, cy: C + 10, w: 300 },
    { type: "text", text: "SINGAPORE 049321", fontSize: 22, fontFamily: "Inter", fontWeight: "600", cx: C, cy: C + 42, w: 300 },
    { type: "text", text: "REG. 2024-00917", fontSize: 18, fontFamily: "Roboto Mono", fontWeight: "400", cx: C, cy: C + 80, w: 300 },
  ],
};
