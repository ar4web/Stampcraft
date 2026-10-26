const C = 310;
const INK = "#003366";

export default {
  id: "jeddahStamp",
  name: "Jeddah",
  cat: "Arabic",
  order: 44,
  tags: ["arabic", "jeddah"],
  build: () => [
    { type: "ellipse", rx: 255, ry: 170, cx: C, cy: C, stroke: INK, strokeWidth: 8, name: "Oval" },
    { type: "ellipse", rx: 232, ry: 148, cx: C, cy: C, stroke: INK, strokeWidth: 2, name: "Inner" },
    {
      type: "text",
      text: "جدة",
      fontSize: 56,
      fontFamily: "Amiri",
      fontWeight: "700",
      fill: INK,
      charSpacing: 0,
      cx: C,
      cy: C - 16,
      w: 400,
      name: "Jeddah AR",
    },
    {
      type: "text",
      text: "JEDDAH",
      fontSize: 22,
      fontFamily: "Oswald",
      fontWeight: "700",
      fill: INK,
      charSpacing: 120,
      cx: C,
      cy: C + 44,
      w: 360,
      name: "Jeddah EN",
    },
  ],
};
