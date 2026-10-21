const C = 310;

export default {
  id: "signatureLine",
  name: "Signature Block",
  tags: ["rect", "sign-off"],
  build: () => [
    { type: "rect", w: 500, h: 220, rx: 8, cx: C, cy: C, strokeWidth: 5 },
    { type: "text", text: "By:", fontSize: 32, fontFamily: "Inter", fontWeight: "700", cx: C - 196, cy: C - 46, w: 90, textAlign: "left" },
    { type: "line", x1: C - 150, y1: C - 26, x2: C + 214, y2: C - 26, strokeWidth: 3 },
    { type: "text", text: "Date:", fontSize: 32, fontFamily: "Inter", fontWeight: "700", cx: C - 180, cy: C + 42, w: 130, textAlign: "left" },
    { type: "line", x1: C - 110, y1: C + 62, x2: C + 214, y2: C + 62, strokeWidth: 3 },
    { type: "text", text: "AUTHORISED SIGNATORY", fontSize: 16, fontFamily: "Inter", fontWeight: "600", charSpacing: 180, cx: C, cy: C + 92, w: 460 },
  ],
};
