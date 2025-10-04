// src/core/constraints.ts
import YAML from "yaml";
import RULES_TEXT from "../rules/constraints.yml";

export type Constraints = {
  difficulte: "auto" | "facile" | "moyen" | "difficile";
  duree: string | null; // normalized like "30min"
  indices: "oui" | "non";
};

type Rules = {
  difficulty: Record<"facile" | "moyen" | "difficile", string[]>;
  indices: Record<"oui" | "non", string[]>;
  duration_hints: string[];
};

const rules = YAML.parse(RULES_TEXT) as Rules;

function norm(s: string): string {
  return s.normalize("NFC").toLowerCase().replace(/\s+/g, " ").trim();
}

function includesWord(paddedHaystack: string, needle: string): boolean {
  const n = norm(needle);
  return (
    paddedHaystack.includes(` ${n} `) ||
    paddedHaystack.endsWith(` ${n}`) ||
    paddedHaystack.includes(` ${n},`) ||
    paddedHaystack.includes(` ${n}.`)
  );
}

/**
 * Normalize durations to minutes only:
 *   - "30 min", "30m"         -> "30min"
 *   - "1h"                     -> "60min"
 *   - "1 h 20", "1h20", "2h30" -> "80min", "150min"
 * Returns null if nothing found.
 */
export function parseDuration(text: string): string | null {
  const t = norm(text);

  // e.g. "1h", "1 h 20", "1h20", "2h30"
  const hMatch = t.match(/(\d+)\s*h(?:\s*(\d{1,2}))?/);
  // e.g. "30 min", "45m", "15 minutes"
  const mMatch = t.match(/(\d+)\s*(?:min|m|minutes?)/);

  if (hMatch) {
    const h = parseInt(hMatch[1], 10);
    const m = hMatch[2] ? parseInt(hMatch[2], 10) : 0;
    const total = h * 60 + (Number.isFinite(m) ? m : 0);
    return `${total}min`;
  }
  if (mMatch) {
    const m = parseInt(mMatch[1], 10);
    return `${m}min`;
  }
  return null;
}

/**
 * Extract difficulty, indices, duration from text, using YAML rules + regex.
 * Falls back to defaults: difficulte="auto", duree=null, indices="oui".
 */
export function extractConstraints(input: string): Constraints {
  const text = norm(input);
  const padded = ` ${text} `;

  // difficulty
  let difficulte: Constraints["difficulte"] = "auto";
  const diffOrder: Array<"facile" | "moyen" | "difficile"> = [
    "facile",
    "moyen",
    "difficile",
  ];
  for (const d of diffOrder) {
    const keys = (rules.difficulty?.[d] ?? []).map(norm);
    if (keys.some((k) => includesWord(padded, k))) {
      difficulte = d;
      break;
    }
  }

  // indices (default oui unless explicit "sans")
  let indices: Constraints["indices"] = "oui";
  const noKeys = (rules.indices?.non ?? []).map(norm);
  const yesKeys = (rules.indices?.oui ?? []).map(norm);
  if (noKeys.some((k) => includesWord(padded, k))) {
    indices = "non";
  } else if (yesKeys.some((k) => includesWord(padded, k))) {
    indices = "oui";
  }

  // duration: always normalized to minutes (string like "30min")
  const duree = parseDuration(text);

  return { difficulte, duree, indices };
}
