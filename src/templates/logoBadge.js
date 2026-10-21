const C = 310;

export default {
  id: "logoBadge",
  name: "Logo Badge",
  tags: ["logo", "rect", "brand"],
  logo: true,
  build: () => [
    { type: "rect", w: 500, h: 250, rx: 0, cx: C, cy: C, strokeWidth: 8 },
    { type: "rect", w: 474, h: 224, rx: 0, cx: C, cy: C, strokeWidth: 1.5 },
    {
      type: "rect",
      w: 120,
      h: 120,
      cx: C - 150,
      cy: C,
      strokeWidth: 2,
      strokeDashArray: [10, 7],
      name: "Logo area",
    },
    { type: "text", text: "LOGO", fontSize: 20, fontFamily: "Inter", fontWeight: "600", charSpacing: 120, cx: C - 150, cy: C, w: 130 },
    { type: "text", text: "BRAND NAME", fontSize: 40, cx: C + 85, cy: C - 44, w: 290 },
    { type: "line", x1: C - 60, y1: C - 10, x2: C + 230, y2: C - 10, strokeWidth: 2 },
    { type: "text", text: "QUALITY CERTIFIED", fontSize: 19, fontFamily: "Inter", fontWeight: "600", charSpacing: 80, cx: C + 85, cy: C + 22, w: 290 },
    { type: "text", text: "EST. 2024", fontSize: 17, fontFamily: "Roboto Mono", fontWeight: "400", cx: C + 85, cy: C + 56, w: 290 },
  ],
};
