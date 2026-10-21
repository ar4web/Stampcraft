const C = 310;

export default {
  id: "hexagonBadge",
  name: "Hexagon Badge",
  tags: ["hexagon", "badge"],
  build: () => [
    { type: "hexagon", r: 250, rotation: -90, cx: C, cy: C, strokeWidth: 9 },
    { type: "hexagon", r: 228, rotation: -90, cx: C, cy: C, strokeWidth: 2 },
    { type: "star", outer: 58, inner: 24, points: 6, cx: C, cy: C - 86, fill: "#000000", strokeWidth: 0, name: "Icon" },
    { type: "text", text: "CERTIFIED", fontSize: 54, cx: C, cy: C + 12, w: 380, charSpacing: 60 },
    { type: "line", x1: C - 120, y1: C + 52, x2: C + 120, y2: C + 52, strokeWidth: 3 },
    { type: "text", text: "QUALITY ASSURED", fontSize: 20, fontFamily: "Inter", fontWeight: "600", charSpacing: 120, cx: C, cy: C + 82, w: 380 },
  ],
};
