// Arabic contextual shaping.
//
// Arc text is drawn glyph-by-glyph around a circle, which destroys Arabic
// cursive joining (letters come out detached: ا ل س ل ا م instead of السلام).
// Browsers normally shape Arabic for us, but only when a whole run is drawn
// in one fillText call. Since we must position each glyph ourselves, we map
// every letter onto its correct Unicode presentation form here.
//
// Each entry: [isolated, final, initial, medial]
// Two-form letters only connect to the PREVIOUS letter, never the next.

const FORMS = {
  0x0621: [0xfe80],
  0x0622: [0xfe81, 0xfe82],
  0x0623: [0xfe83, 0xfe84],
  0x0624: [0xfe85, 0xfe86],
  0x0625: [0xfe87, 0xfe88],
  0x0626: [0xfe89, 0xfe8a, 0xfe8b, 0xfe8c],
  0x0627: [0xfe8d, 0xfe8e],
  0x0628: [0xfe8f, 0xfe90, 0xfe91, 0xfe92],
  0x0629: [0xfe93, 0xfe94],
  0x062a: [0xfe95, 0xfe96, 0xfe97, 0xfe98],
  0x062b: [0xfe99, 0xfe9a, 0xfe9b, 0xfe9c],
  0x062c: [0xfe9d, 0xfe9e, 0xfe9f, 0xfea0],
  0x062d: [0xfea1, 0xfea2, 0xfea3, 0xfea4],
  0x062e: [0xfea5, 0xfea6, 0xfea7, 0xfea8],
  0x062f: [0xfea9, 0xfeaa],
  0x0630: [0xfeab, 0xfeac],
  0x0631: [0xfead, 0xfeae],
  0x0632: [0xfeaf, 0xfeb0],
  0x0633: [0xfeb1, 0xfeb2, 0xfeb3, 0xfeb4],
  0x0634: [0xfeb5, 0xfeb6, 0xfeb7, 0xfeb8],
  0x0635: [0xfeb9, 0xfeba, 0xfebb, 0xfebc],
  0x0636: [0xfebd, 0xfebe, 0xfebf, 0xfec0],
  0x0637: [0xfec1, 0xfec2, 0xfec3, 0xfec4],
  0x0638: [0xfec5, 0xfec6, 0xfec7, 0xfec8],
  0x0639: [0xfec9, 0xfeca, 0xfecb, 0xfecc],
  0x063a: [0xfecd, 0xfece, 0xfecf, 0xfed0],
  0x0641: [0xfed1, 0xfed2, 0xfed3, 0xfed4],
  0x0642: [0xfed5, 0xfed6, 0xfed7, 0xfed8],
  0x0643: [0xfed9, 0xfeda, 0xfedb, 0xfedc],
  0x0644: [0xfedd, 0xfede, 0xfedf, 0xfee0],
  0x0645: [0xfee1, 0xfee2, 0xfee3, 0xfee4],
  0x0646: [0xfee5, 0xfee6, 0xfee7, 0xfee8],
  0x0647: [0xfee9, 0xfeea, 0xfeeb, 0xfeec],
  0x0648: [0xfeed, 0xfeee],
  0x0649: [0xfeef, 0xfef0],
  0x064a: [0xfef1, 0xfef2, 0xfef3, 0xfef4],
  0x0671: [0xfb50, 0xfb51],
  0x067e: [0xfb56, 0xfb57, 0xfb58, 0xfb59], // peh
  0x0686: [0xfb7a, 0xfb7b, 0xfb7c, 0xfb7d], // tcheh
  0x0698: [0xfb8a, 0xfb8b], // jeh
  0x06a9: [0xfb8e, 0xfb8f, 0xfb90, 0xfb91], // keheh
  0x06af: [0xfb92, 0xfb93, 0xfb94, 0xfb95], // gaf
  0x06cc: [0xfbfc, 0xfbfd, 0xfbfe, 0xfbff], // farsi yeh
};

// lam + alef variants collapse into a single mandatory ligature.
const LAM = 0x0644;
const LAM_ALEF = {
  0x0622: [0xfef5, 0xfef6],
  0x0623: [0xfef7, 0xfef8],
  0x0625: [0xfef9, 0xfefa],
  0x0627: [0xfefb, 0xfefc],
};

const isTashkeel = (cp) =>
  (cp >= 0x064b && cp <= 0x065f) || cp === 0x0670 || cp === 0x0640;

const joinsBefore = (cp) => !!FORMS[cp]; // has a final form
const joinsAfter = (cp) => !!FORMS[cp] && FORMS[cp].length === 4;

/** True when the string contains Arabic/Persian/Urdu range characters. */
export function hasArabic(text) {
  return /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(
    String(text || "")
  );
}

/** True for any right-to-left script (Arabic or Hebrew). */
export function isRTL(text) {
  return hasArabic(text) || /[\u0590-\u05FF]/.test(String(text || ""));
}

/**
 * Converts a logical Arabic string into shaped clusters in VISUAL order
 * (already reversed, so index 0 is the left-most glyph on screen).
 * Non-Arabic characters pass through untouched.
 */
export function shapeArabicClusters(input) {
  const text = String(input || "");
  const cps = Array.from(text).map((c) => c.codePointAt(0));

  // 1. Fold lam+alef pairs into single code points before shaping.
  const folded = [];
  for (let i = 0; i < cps.length; i++) {
    if (cps[i] === LAM && LAM_ALEF[cps[i + 1]]) {
      folded.push({ lig: LAM_ALEF[cps[i + 1]], marks: [] });
      i++;
    } else if (isTashkeel(cps[i]) && folded.length) {
      // diacritics ride along with the previous base letter
      folded[folded.length - 1].marks.push(cps[i]);
    } else {
      folded.push({ cp: cps[i], marks: [] });
    }
  }

  // 2. Pick the right presentation form for every base letter.
  const out = folded.map((item, i) => {
    const prev = folded[i - 1];
    const next = folded[i + 1];
    const prevJoins = prev ? (prev.lig ? false : joinsAfter(prev.cp)) : false;
    const nextJoins = next ? (next.lig ? true : joinsBefore(next.cp)) : false;

    let glyph;
    if (item.lig) {
      // lam-alef: isolated or final only
      glyph = String.fromCodePoint(item.lig[prevJoins ? 1 : 0]);
    } else {
      const forms = FORMS[item.cp];
      if (!forms) {
        glyph = String.fromCodePoint(item.cp);
      } else if (forms.length === 4) {
        const idx =
          prevJoins && nextJoins ? 3 : prevJoins ? 1 : nextJoins ? 2 : 0;
        glyph = String.fromCodePoint(forms[idx]);
      } else {
        glyph = String.fromCodePoint(forms[prevJoins ? 1 : 0]);
      }
    }
    return glyph + item.marks.map((m) => String.fromCodePoint(m)).join("");
  });

  // 3. Arabic reads right-to-left, so flip for left-to-right placement.
  return out.reverse();
}

/**
 * Splits any string into drawable clusters in visual order.
 * Arabic gets shaped + reversed; everything else is a plain grapheme split.
 */
export function toVisualClusters(text) {
  if (hasArabic(text)) return shapeArabicClusters(text);
  return Array.from(String(text || ""));
}
