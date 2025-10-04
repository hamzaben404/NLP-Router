// src/core/intent.ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

export type Intent =
  | "ASK_EXPLANATION"
  | "START_DIAGNOSTIC"
  | "PRACTICE_TOPIC"
  | "CHECK_SOLUTION"
  | "GENERATE_PLAN"
  | "OTHER_SUPPORT";

type Rules = {
  order: Intent[];
  patterns: Record<Intent, string[]>;
};

let compiled:
  | {
      order: Intent[];
      regexes: Record<Intent, RegExp[]>;
    }
  | null = null;

function loadRules() {
  if (compiled) return compiled;

  const here = path.dirname(fileURLToPath(import.meta.url));
  const rulesPath = path.join(here, "../rules/regex-intents.yml");
  const rulesText = fs.readFileSync(rulesPath, "utf8");
  const rules = yaml.load(rulesText) as Rules;

  const regexes: Record<Intent, RegExp[]> = {
    ASK_EXPLANATION: [],
    START_DIAGNOSTIC: [],
    PRACTICE_TOPIC: [],
    CHECK_SOLUTION: [],
    GENERATE_PLAN: [],
    OTHER_SUPPORT: [],
  };

  for (const intent of rules.order) {
    const pats = rules.patterns[intent] ?? [];
    regexes[intent] = pats.map((p) => new RegExp(p, "i"));
  }

  compiled = { order: rules.order, regexes };
  return compiled;
}

// Quick pre-checks to catch fragile phrasing regardless of punctuation/accents normalization.
function quickHeuristics(s: string): Intent | null {
  // CHECK_SOLUTION: mentions a solution/answer + correctness/verify/correct
  const hasSolutionWord = /\b(solution|r[ée]ponse)\b/i.test(s);
  const hasCheckWord =
    /\b(corrig(er|e)|v[ée]rif(ier|ie))\b/i.test(s) ||
    /\best[-\s]?ce\b/i.test(s) || // just "est-ce" or "est ce" is enough
    /\b(correct|juste|bon)\b/i.test(s);

  if (hasSolutionWord && hasCheckWord) return "CHECK_SOLUTION";

  // PRACTICE_TOPIC: bare "exercices / qcm" without explicit "sur/de …"
  if (/\b(exercice|exercices|entrainement|entraînement|qcm)\b/i.test(s)) return "PRACTICE_TOPIC";

  return null;
}

export function detectIntent(normalized: string): Intent | null {
  // 0) fast heuristics first (handles punctuation/spacing edge cases)
  const fast = quickHeuristics(normalized);
  if (fast) return fast;

  // 1) YAML-driven rules
  const { order, regexes } = loadRules();
  for (const intent of order) {
    const res = regexes[intent].some((re) => re.test(normalized));
    if (res) return intent;
  }
  return null;
}