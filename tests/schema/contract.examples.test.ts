// tests/schema/contract.examples.test.ts
import { describe, it, expect } from "vitest";
import { validateRouterOutput } from "../../src/validation/validate";

describe("API contract examples validate against schema", () => {
  it("ROUTE example", () => {
    const ex = {
      action: "ROUTE",
      language: "fr",
      intent: "PRACTICE_TOPIC",
      level: "3e_college",
      topic: "derivees",
      subtopic: null,
      format: "exercice",
      constraints: { difficulte: "moyen", duree: null, indices: "oui" }
    };
    expect(() => validateRouterOutput(ex)).not.toThrow();
  });

  it("CLARIFY example", () => {
    const ex = {
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
    expect(() => validateRouterOutput(ex)).not.toThrow();
  });

  it("UNSUPPORTED_LANGUAGE example", () => {
    const ex = {
      action: "UNSUPPORTED_LANGUAGE",
      language: "non_fr",
      intent: null,
      level: null,
      topic: null,
      subtopic: null,
      format: null,
      constraints: { difficulte: "auto", duree: null, indices: "oui" },
      reasonCode: "unsupported_language"
    };
    expect(() => validateRouterOutput(ex)).not.toThrow();
  });

  it("BLOCKED example", () => {
    const ex = {
      action: "BLOCKED",
      language: "fr",
      intent: null,
      level: null,
      topic: null,
      subtopic: null,
      format: null,
      constraints: { difficulte: "auto", duree: null, indices: "oui" },
      reasonCode: "inappropriate_content"
    };
    expect(() => validateRouterOutput(ex)).not.toThrow();
  });
});
