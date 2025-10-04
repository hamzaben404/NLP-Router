// src/core/safety.ts
export type SafetyVerdict =
  | { ok: true }
  | { ok: false; reasonCode: "inappropriate_content" };

const BAD_PATTERNS: RegExp[] = [
  // very small seed list; expand later as needed
  /\b(porn|porno|pornographique)\b/i,
  /\b(sexe|sexuel|sexuelle|nue?s?)\b/i,
  /\b(viol|violence|tuer|meurtre|suicide)\b/i,
  /\b(haine|insulte?s?)\b/i,
];

export function checkSafety(text: string): SafetyVerdict {
  const t = text.normalize("NFC");
  for (const re of BAD_PATTERNS) {
    if (re.test(t)) return { ok: false, reasonCode: "inappropriate_content" };
  }
  return { ok: true };
}
