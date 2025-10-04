import { describe, it, expect } from "vitest";
import { detectIntent } from "../../src/core/intent";
import { normalizePrompt } from "../../src/core/normalize";
import { routePrompt } from "../../src/index";

function N(s: string) {
  return normalizePrompt(s);
}

describe("detectIntent", () => {
  it("START_DIAGNOSTIC", () => {
    expect(detectIntent(N("je veux passer un test de niveau"))).toBe("START_DIAGNOSTIC");
  });
  it("CHECK_SOLUTION", () => {
    expect(detectIntent(N("voici ma solution, est-ce correct ?"))).toBe("CHECK_SOLUTION");
  });
  it("GENERATE_PLAN", () => {
    expect(detectIntent(N("fais-moi un plan de révision pour 2eme bac"))).toBe("GENERATE_PLAN");
  });
  it("PRACTICE_TOPIC", () => {
    expect(detectIntent(N("exercices sur les équations du 2nd degré"))).toBe("PRACTICE_TOPIC");
  });
  it("ASK_EXPLANATION", () => {
    expect(detectIntent(N("explique-moi la dérivée d'une somme"))).toBe("ASK_EXPLANATION");
  });
  it("OTHER_SUPPORT", () => {
    expect(detectIntent(N("j'ai un problème d'abonnement, le paiement échoue"))).toBe("OTHER_SUPPORT");
  });
  it("no match → null", () => {
    expect(detectIntent(N("hmm"))).toBe(null);
  });
});

describe("routePrompt sets intent and routes when info is sufficient", () => {
  it("sets PRACTICE_TOPIC and ROUTE when topic is present", () => {
    const out = routePrompt({ message: "Je veux des exercices sur les dérivées" });
    expect(out.language).toBe("fr");
    expect(out.intent).toBe("PRACTICE_TOPIC");
    expect(out.action).toBe("ROUTE"); // updated: we route when info is sufficient
  });
});
