const C = 310;

export default {
  id: "modernRect",
  name: "Modern Rectangle",
  tags: ["rect", "3 lines"],
  build: () => [
    { type: "rect", w: 460, h: 240, rx: 22, cx: C, cy: C, strokeWidth: 7, name: "Border" },
    { type: "rect", w: 432, h: 212, rx: 16, cx: C, cy: C, strokeWidth: 2, name: "Inner border" },
    { type: "text", text: "NORTHSTAR LTD.", fontSize: 44, cx: C, cy: C - 58, w: 420 },
    { type: "text", text: "DOCUMENT CONTROL", fontSize: 26, fontFamily: "Inter", fontWeight: "600", cx: C, cy: C + 2, w: 420 },
    { type: "text", text: "QUALITY  •  VERIFIED  •  2024", fontSize: 20, fontFamily: "Inter", fontWeight: "400", cx: C, cy: C + 58, w: 420 },
  ],
};
