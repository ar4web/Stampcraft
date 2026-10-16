const C = 310;

export default {
  id: "ovalStamp",
  name: "Bold Oval",
  tags: ["oval", "2 lines"],
  build: () => [
    { type: "ellipse", rx: 258, ry: 160, cx: C, cy: C, strokeWidth: 12 },
    { type: "text", text: "ATLAS STUDIO", fontSize: 54, cx: C, cy: C - 30, w: 440, charSpacing: 60 },
    { type: "text", text: "DESIGN & PRINT", fontSize: 28, fontFamily: "Inter", fontWeight: "600", charSpacing: 160, cx: C, cy: C + 36, w: 440 },
  ],
};
