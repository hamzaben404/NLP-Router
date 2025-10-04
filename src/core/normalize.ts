// src/core/normalize.ts

/**
 * Normalize a user prompt:
 * - NFC unicode
 * - trim
 * - collapse internal whitespace
 * - unify odd spaces (no-break, etc.)
 * - normalize Arabic-Indic digits → Western 0-9
 * - keep accents (important in FR)
 */
export function normalizePrompt(raw: string): string {
  if (!raw) return "";
  let s = raw.normalize("NFC");

  // unify whitespace variants
  s = s.replace(/\s+/g, " ");
  s = s.replace(/[\u00A0\u2007\u202F]/g, " "); // nbsp, figure space, narrow nbsp
  s = s.trim();

  // Arabic-Indic digits → Western
  // ٠١٢٣٤٥٦٧٨٩ (Arabic-Indic) ۰۱۲۳۴۵۶۷۸۹ (Eastern Arabic-Indic)
  const arabicIndic = /[\u0660-\u0669\u06F0-\u06F9]/g;
  s = s.replace(arabicIndic, (d) => {
    const code = d.codePointAt(0)!;
    // ranges: 0x660-0x669 and 0x6F0-0x6F9 map to 0..9
    const val = (code >= 0x0660 && code <= 0x0669) ? code - 0x0660 : code - 0x06F0;
    return String(val);
  });

  // collapse spaces again after replacements
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

/**
 * Lightweight French detector (no external lib):
 * Heuristic: if prompt contains enough FR function words or typical markers.
 * Returns true if likely French, false otherwise.
 */
export function isLikelyFrench(s: string): boolean {
  const text = s.toLowerCase();

  // very short → can't decide; let next steps clarify instead of blocking
  if (text.length < 4) return true;

  // common FR function words / artifacts
  const frCues = [
    " le ", " la ", " les ", " des ", " un ", " une ", " du ",
    " je ", " tu ", " il ", " elle ", " nous ", " vous ", " ils ", " elles ",
    " que ", " qui ", " quoi ", " dont ", " où ",
    " dans ", " sur ", " sous ", " avec ", " sans ", " entre ",
    " est ", " et ", " ou ", " mais ", " donc ", " or ", " ni ", " car ",
    " pourquoi ", " parce que ", " comment ",
    " ma ", " mon ", " mes ", " ta ", " ton ", " tes ", " sa ", " son ", " ses ", // ADDED: possessives
    " ce ", " cette ", " ces ", // ADDED: demonstratives
    " voici ", " voilà ", // ADDED: common presentatives
    " équation", " dérivée", " inéquation", " géométrie", " fonction", " racine", " fraction"
  ];

  const padded = ` ${text} `;
  let hits = 0;
  for (const cue of frCues) {
    if (padded.includes(cue)) hits++;
    if (hits >= 2) break;
  }

  // heuristic thresholds:
  // - 2+ cues → likely FR
  if (hits >= 2) return true;

  // Allow FR-looking tokens with diacritics to count as a cue
  if (/[àâäçéèêëîïôöùûüÿœ]/i.test(text)) hits++;

  return hits >= 2;
}
