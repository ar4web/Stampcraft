const C = 310;

export default {
  id: "logoRound",
  name: "Logo Round",
  tags: ["logo", "round", "arc"],
  logo: true,
  build: () => [
    { type: "circle", r: 250, cx: C, cy: C, strokeWidth: 7 },
    { type: "circle", r: 232, cx: C, cy: C, strokeWidth: 2 },
    // Dashed ring marks where an imported logo should sit.
    {
      type: "circle",
      r: 96,
      cx: C,
      cy: C - 34,
      strokeWidth: 2,
      strokeDashArray: [10, 7],
      name: "Logo area",
    },
    { type: "text", text: "LOGO", fontSize: 26, fontFamily: "Inter", fontWeight: "600", charSpacing: 180, cx: C, cy: C - 34, w: 180 },
    {
      type: "arc",
      text: "YOUR BRAND HERE",
      radius: 206,
      position: "bottom",
      fontSize: 32,
      letterSpacing: 4,
      cx: C,
      cy: C,
    },
    { type: "line", x1: C - 110, y1: C + 86, x2: C + 110, y2: C + 86, strokeWidth: 3 },
  ],
};
