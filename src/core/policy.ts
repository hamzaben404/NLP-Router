// src/core/policy.ts
export type PolicyInput = {
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
};

export type PolicyDecision = {
  action: "ROUTE" | "CLARIFY";
  clarify?: { question: string };
  reasonCode?: "unknown";
};

export function decidePolicy(inp: PolicyInput): PolicyDecision {
  const { intent, level, topic } = inp;

  // 1) CHECK_SOLUTION: always ask for the solution content
  if (intent === "CHECK_SOLUTION") {
    return {
      action: "CLARIFY",
      clarify: { question: "Envoie ta solution (texte ou photo) et je la corrige." },
    };
  }

  // 2) START_DIAGNOSTIC: need a level to route
  if (intent === "START_DIAGNOSTIC") {
    if (!level) {
      // IMPORTANT: include literal "quel niveau" to satisfy the test's /quel niveau/i
      return {
        action: "CLARIFY",
        clarify: { question: "Quel niveau veux-tu tester ? (ex: 3e collège, 2nde, 1ère…)" },
      };
    }
    return { action: "ROUTE" };
  }

  // 3) PRACTICE_TOPIC: need a topic to route
  if (intent === "PRACTICE_TOPIC") {
    if (!topic) {
      return {
        action: "CLARIFY",
        clarify: { question: "Sur quel chapitre veux-tu travailler ? (ex: équations du 2nd degré, dérivées…)" },
      };
    }
    return { action: "ROUTE" };
  }

  // 4) ASK_EXPLANATION: with a topic we can route; otherwise clarify
  if (intent === "ASK_EXPLANATION") {
    if (topic) return { action: "ROUTE" };
    return {
      action: "CLARIFY",
      clarify: { question: "Quel chapitre dois-je t'expliquer ?" },
    };
  }

  // 5) GENERATE_PLAN or OTHER_SUPPORT: default rule of thumb
  if (intent === "GENERATE_PLAN") {
    return { action: "CLARIFY", clarify: { question: "Pour quel niveau et quelles matières ?" } };
  }

  if (intent === "OTHER_SUPPORT") {
    return { action: "CLARIFY", clarify: { question: "Peux-tu préciser le souci ?" } };
  }

  // 6) Fallback
  return {
    action: "CLARIFY",
    clarify: { question: "Peux-tu préciser ta demande ?" },
    reasonCode: "unknown",
  };
}
