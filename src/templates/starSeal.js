const C = 310;

export default {
  id: "starSeal",
  name: "Star Seal",
  tags: ["star", "arc"],
  build: () => [
    { type: "circle", r: 254, cx: C, cy: C, strokeWidth: 5 },
    { type: "star", outer: 190, inner: 80, points: 5, cx: C, cy: C + 6, strokeWidth: 6, name: "Star outline" },
    {
      type: "arc",
      text: "OFFICIAL SEAL",
      radius: 220,
      position: "top",
      fontSize: 32,
      letterSpacing: 5,
      cx: C,
      cy: C,
    },
    {
      type: "arc",
      text: "AUTHENTIC",
      radius: 220,
      position: "bottom",
      fontSize: 26,
      letterSpacing: 6,
      cx: C,
      cy: C,
    },
    { type: "text", text: "2024", fontSize: 40, fontFamily: "Oswald", cx: C, cy: C + 24, w: 220 },
  ],
};
