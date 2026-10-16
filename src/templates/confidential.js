const C = 310;

export default {
  id: "confidential",
  name: "Confidential",
  tags: ["rect", "security"],
  build: () => [
    { type: "rect", w: 520, h: 200, rx: 4, cx: C, cy: C, strokeWidth: 10 },
    { type: "rect", w: 494, h: 174, rx: 2, cx: C, cy: C, strokeWidth: 2 },
    { type: "text", text: "CONFIDENTIAL", fontSize: 62, cx: C, cy: C - 10, w: 500, charSpacing: 40 },
    { type: "text", text: "DO NOT DISTRIBUTE", fontSize: 20, fontFamily: "Inter", fontWeight: "600", cx: C, cy: C + 52, w: 480, charSpacing: 200 },
    { type: "rect", w: 540, h: 14, cx: C, cy: C - 86, angle: -6, fill: "#000000", strokeWidth: 0, opacity: 0.85, name: "Ink strip" },
    { type: "rect", w: 540, h: 14, cx: C, cy: C + 86, angle: -6, fill: "#000000", strokeWidth: 0, opacity: 0.85, name: "Ink strip" },
  ],
};
