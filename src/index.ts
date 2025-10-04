// src/index.ts
import { normalizePrompt, isLikelyFrench } from "./core/normalize.js";
import { detectIntent } from "./core/intent.js";
import { extractSlots } from "./core/slots.js";
import { extractConstraints } from "./core/constraints.js";
import { checkSafety } from "./core/safety.js";
import { decidePolicy } from "./core/policy.js";
import { validateRouterOutput } from "./validation/validate.js";

export type RouterInput = {
  message: string;
  userProfile?: { level?: string | null };
};

export type RouterOutput = {
  action: "ROUTE" | "CLARIFY" | "UNSUPPORTED_LANGUAGE" | "BLOCKED";
  language: "fr" | "non_fr" | null;
  intent:
    | "ASK_EXPLANATION"
    | "START_DIAGNOSTIC"
    | "PRACTICE_TOPIC"
    | "CHECK_SOLUTION"
    | "GENERATE_PLAN"
    | "OTHER_SUPPORT"
    | null;
  level: string | null;
  topic: string | null;
  subtopic: string | null;
  format: "cours" | "exercice" | "qcm" | "demonstration" | null;
  constraints: {
    difficulte: "auto" | "facile" | "moyen" | "difficile";
    duree: string | null; // e.g. "30min"
    indices: "oui" | "non";
  };
  clarify?: { question: string };
  reasonCode?:
    | "unsupported_language"
    | "inappropriate_content"
    | "internal_validation_error"
    | "unknown";
};

export function routePrompt(input: RouterInput): RouterOutput {
  const raw = input?.message ?? "";
  const normalized = normalizePrompt(raw);

  // Empty / unusable input → ask to clarify (FR placeholder)
  if (!normalized) {
    const out: RouterOutput = {
      action: "CLARIFY",
      language: "fr",
      intent: null,
      level: input.userProfile?.level ?? null,
      topic: null,
      subtopic: null,
      format: "cours",
      constraints: { difficulte: "auto", duree: null, indices: "oui" },
      clarify: { question: "Peux-tu préciser ta demande en français ?" },
    };
    validateRouterOutput(out);
    return out;
  }

  // 1) Safety first
  const sv = checkSafety(normalized);
  if (!sv.ok) {
    const out: RouterOutput = {
      action: "BLOCKED",
      language: "fr", // not really used in BLOCKED
      intent: null,
      level: input.userProfile?.level ?? null,
      topic: null,
      subtopic: null,
      format: null,
      constraints: { difficulte: "auto", duree: null, indices: "oui" },
      reasonCode: sv.reasonCode,
    };
    validateRouterOutput(out);
    return out;
  }

  // 2) Language gate (FR only)
  if (!isLikelyFrench(normalized)) {
    const out: RouterOutput = {
      action: "UNSUPPORTED_LANGUAGE",
      language: "non_fr",
      intent: null,
      level: input.userProfile?.level ?? null,
      topic: null,
      subtopic: null,
      format: null,
      constraints: { difficulte: "auto", duree: null, indices: "oui" },
      reasonCode: "unsupported_language",
    };
    validateRouterOutput(out);
    return out;
  }

  // 3) Semantic extraction
  let intent = detectIntent(normalized);

  // Robust fallback for CHECK_SOLUTION phrasing
  // - Accepts "solution" or "réponse"
  // - Accepts "est-ce correct" with or without hyphen
  // - Accepts verbs: corriger/vérifier
  if (!intent) {
    const hasSolutionWord = /\b(solution|r[ée]ponse)\b/i.test(normalized);
    const hasCheckWord =
      /\b(corrig(?:e|er)|v[ée]rif(?:ier|ie|er)?)\b/i.test(normalized) ||
      /\best[-\s]?ce\b.*\b(correct|juste|bon)\b/i.test(normalized) ||
      /\b(correct|juste|bon)\b/i.test(normalized);

    if (hasSolutionWord && hasCheckWord) {
      intent = "CHECK_SOLUTION";
    }
  }

  const slots = extractSlots(normalized);
  const constraints = extractConstraints(normalized);

  // 4) Policy decision
  const policy = decidePolicy({
    intent,
    level: slots.level ?? input.userProfile?.level ?? null,
    topic: slots.topic,
    subtopic: slots.subtopic,
    format: slots.format,
  });

  // 5) Build output
  const out: RouterOutput = {
    action: policy.action,
    language: "fr",
    intent,
    level: slots.level ?? input.userProfile?.level ?? null,
    topic: slots.topic,
    subtopic: slots.subtopic,
    format: slots.format ?? (intent === "PRACTICE_TOPIC" ? "exercice" : "cours"),
    constraints,
    ...(policy.clarify ? { clarify: policy.clarify } : {}),
    ...(policy.reasonCode ? { reasonCode: policy.reasonCode } : {}),
  };

  validateRouterOutput(out);
  return out;
}