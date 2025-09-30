export type RouterInput = { message: string; userProfile?: { level?: string|null } };
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
  constraints: { difficulte: "auto" | "facile" | "moyen" | "difficile"; duree: string | null; indices: "oui" | "non" };
};

/** Placeholder impl so build/tests pass */
export function routePrompt(_input: RouterInput): RouterOutput {
  return {
    action: "CLARIFY",
    language: "fr",
    intent: null,
    level: null,
    topic: null,
    subtopic: null,
    format: "cours",
    constraints: { difficulte: "auto", duree: null, indices: "oui" }
  };
}
