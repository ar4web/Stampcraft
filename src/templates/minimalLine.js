const C = 310;

export default {
  id: "minimalLine",
  name: "Minimal Line",
  tags: ["minimal", "thin"],
  build: () => [
    { type: "rect", w: 460, h: 130, rx: 2, cx: C, cy: C, strokeWidth: 1.5 },
    { type: "text", text: "REVIEWED", fontSize: 44, fontFamily: "Inter", fontWeight: "400", charSpacing: 320, cx: C, cy: C, w: 430 },
  ],
};
