const C = 310;
const today = () =>
  new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).toUpperCase();

export default {
  id: "dateStamp",
  name: "Date Received",
  tags: ["date", "office"],
  build: () => [
    { type: "rect", w: 470, h: 250, rx: 6, cx: C, cy: C, strokeWidth: 8, name: "Border" },
    { type: "text", text: "RECEIVED", fontSize: 52, cx: C, cy: C - 70, w: 430, charSpacing: 120 },
    { type: "line", x1: C - 200, y1: C - 26, x2: C + 200, y2: C - 26, strokeWidth: 3 },
    { type: "text", text: today(), fontSize: 40, fontFamily: "Roboto Mono", cx: C, cy: C + 10, w: 430 },
    { type: "text", text: "TIME: ____:____", fontSize: 26, fontFamily: "Roboto Mono", fontWeight: "400", cx: C, cy: C + 72, w: 430 },
  ],
};
