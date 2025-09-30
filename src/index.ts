// src/index.ts
export type RouterInput = { message: string; userProfile?: { level?: string | null } };

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
    duree: string | null; // "NNmin" or null
    indices: "oui" | "non";
  };
  clarify?: { question: string }; // only when action === "CLARIFY"
  reasonCode?: "unsupported_language" | "inappropriate_content" | "internal_validation_error" | "unknown"; // only for UNSUPPORTED_LANGUAGE/BLOCKED
};

/** Temporary placeholder impl */
export function routePrompt(_input: RouterInput): RouterOutput {
  return {
    action: "CLARIFY",
    language: "fr",
    intent: null,
    level: null,
    topic: null,
    subtopic: null,
    format: "cours",
    constraints: { difficulte: "auto", duree: null, indices: "oui" },
    clarify: { question: "Sur quel chapitre veux-tu travailler ?" }
  };
}
