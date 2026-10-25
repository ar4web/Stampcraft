import singleRing from "./singleRing.js";
import classicRound from "./classicRound.js";
import corporateSeal from "./corporateSeal.js";
import approvedCircle from "./approvedCircle.js";
import starSeal from "./starSeal.js";
import squareSeal from "./squareSeal.js";
import modernRect from "./modernRect.js";
import dateStamp from "./dateStamp.js";
import serialStamp from "./serialStamp.js";
import confidential from "./confidential.js";
import signatureLine from "./signatureLine.js";
import minimalLine from "./minimalLine.js";
import ovalStamp from "./ovalStamp.js";
import paidStamp from "./paidStamp.js";
import hexagonBadge from "./hexagonBadge.js";
import logoRound from "./logoRound.js";
import logoBadge from "./logoBadge.js";

// Ordered: single ring first, then double, triple, square, the rest.
const annotate = (tpl, cat, order) => ({ ...tpl, cat: tpl.cat || cat, order: tpl.order ?? order });

export const TEMPLATES = [
  annotate(singleRing, "Round", 1),
  annotate(classicRound, "Round", 2),
  annotate(corporateSeal, "Round", 3),
  annotate(approvedCircle, "Round", 4),
  annotate(starSeal, "Round", 5),
  annotate(squareSeal, "Square & Rect", 10),
  annotate(modernRect, "Square & Rect", 11),
  annotate(dateStamp, "Square & Rect", 12),
  annotate(serialStamp, "Square & Rect", 12.5),
  annotate(confidential, "Square & Rect", 13),
  annotate(signatureLine, "Square & Rect", 14),
  annotate(minimalLine, "Square & Rect", 15),
  annotate(ovalStamp, "Oval & Badge", 20),
  annotate(paidStamp, "Oval & Badge", 21),
  annotate(hexagonBadge, "Oval & Badge", 22),
  annotate(logoRound, "Logo", 30),
  annotate(logoBadge, "Logo", 31),
].sort((a, b) => a.order - b.order);

export const TEMPLATE_CATEGORIES = ["Round", "Square & Rect", "Oval & Badge", "Logo"];

export const getTemplate = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];

export default TEMPLATES;
