export const TEXT_PHRASES = [
  { group: "Office", items: ["APPROVED", "RECEIVED", "PAID", "COPY", "ORIGINAL", "VERIFIED", "CONFIDENTIAL", "DRAFT"] },
  {
    group: "Saudi / Arabic",
    items: [
      "الرياض",
      "RIYADH",
      "جدة",
      "JEDDAH",
      "الدمام",
      "DAMMAM",
      "مكة المكرمة",
      "المدينة المنورة",
      "المملكة العربية السعودية",
      "KSA",
      "SAUDI ARABIA",
    ],
  },
  {
    group: "Post & register",
    items: [
      "P.O. BOX",
      "الرمز البريدي",
      "ZIP",
      "POSTAL CODE",
      "س.ت",
      "C.R.",
      "ض.ق.م",
      "VAT",
      "سجل تجاري",
    ],
  },
];

export const STAMP_LOOKS = [
  { id: "round-arc", label: "Round arc", shape: "round" },
  { id: "round-center", label: "Round centre", shape: "round" },
  { id: "rect", label: "Rect", shape: "rect" },
  { id: "square", label: "Square", shape: "square" },
  { id: "oval", label: "Oval", shape: "oval" },
  { id: "bilingual", label: "Bilingual", shape: "round" },
];

export const OFFICE_MARKS = [
  { word: "APPROVED", look: "dated" },
  { word: "PAID", look: "oval" },
  { word: "COPY", look: "rect" },
  { word: "VOID", look: "slant" },
  { word: "RECEIVED", look: "dated" },
  { word: "ORIGINAL", look: "rect" },
  { word: "CONFIDENTIAL", look: "banner" },
  { word: "DRAFT", look: "slant" },
  { word: "URGENT", look: "banner" },
  { word: "FILED", look: "round" },
  { word: "VERIFIED", look: "round" },
  { word: "SAMPLE", look: "oval" },
  { word: "REJECTED", look: "slant" },
  { word: "CANCELLED", look: "banner" },
  { word: "COMPLETED", look: "dated" },
  { word: "FOR REVIEW", look: "rect" },
];

export const MARK_LOOKS = [
  { id: "round", label: "Round" },
  { id: "oval", label: "Oval" },
  { id: "rect", label: "Rect" },
  { id: "dated", label: "With date" },
  { id: "banner", label: "Banner" },
  { id: "slant", label: "Slant" },
];

export const FIELD_STAMPS = [
  { id: "date", label: "Today", look: "round", format: "DD MMM YYYY" },
  { id: "time", label: "Time", look: "oval" },
  { id: "datetime", label: "Date + time", look: "rect", format: "DD MMM YYYY" },
  { id: "serial", label: "Serial", look: "rect" },
];

export const FIELD_LOOKS = [
  { id: "round", label: "Round" },
  { id: "oval", label: "Oval" },
  { id: "rect", label: "Rect" },
];
