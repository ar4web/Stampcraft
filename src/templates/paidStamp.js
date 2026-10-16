const C = 310;

export default {
  id: "paidStamp",
  name: "Paid Oval",
  tags: ["oval", "finance"],
  build: () => [
    { type: "ellipse", rx: 262, ry: 168, cx: C, cy: C, strokeWidth: 9 },
    { type: "ellipse", rx: 246, ry: 152, cx: C, cy: C, strokeWidth: 2 },
    { type: "text", text: "PAID", fontSize: 108, cx: C, cy: C - 32, w: 440, charSpacing: 60 },
    { type: "line", x1: C - 170, y1: C + 36, x2: C + 170, y2: C + 36, strokeWidth: 3 },
    { type: "text", text: "DATE: ____ / ____ / ______", fontSize: 22, fontFamily: "Roboto Mono", fontWeight: "400", cx: C, cy: C + 64, w: 400 },
    { type: "text", text: "INVOICE # ______________", fontSize: 22, fontFamily: "Roboto Mono", fontWeight: "400", cx: C, cy: C + 100, w: 400 },
  ],
};
