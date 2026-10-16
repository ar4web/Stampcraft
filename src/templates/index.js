import classicRound from "./classicRound";
import modernRect from "./modernRect";
import dateStamp from "./dateStamp";
import approvedCircle from "./approvedCircle";
import corporateSeal from "./corporateSeal";
import paidStamp from "./paidStamp";
import confidential from "./confidential";
import signatureLine from "./signatureLine";
import ovalStamp from "./ovalStamp";
import hexagonBadge from "./hexagonBadge";
import starSeal from "./starSeal";
import minimalLine from "./minimalLine";

export const TEMPLATES = [
  classicRound,
  modernRect,
  dateStamp,
  approvedCircle,
  corporateSeal,
  paidStamp,
  confidential,
  signatureLine,
  ovalStamp,
  hexagonBadge,
  starSeal,
  minimalLine,
];

export const getTemplate = (id) => TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];

export default TEMPLATES;
