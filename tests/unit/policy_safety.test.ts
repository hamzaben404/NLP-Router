import { describe, it, expect } from "vitest";
import { routePrompt } from "../../src/index";
import { normalizePrompt } from "../../src/core/normalize";
import { detectIntent } from "../../src/core/intent";

describe("policy: ROUTE vs CLARIFY", () => {
  it("START_DIAGNOSTIC without level -> CLARIFY", () => {
    const out = routePrompt({ message: "je veux passer un test" });
    expect(out.intent).toBe("START_DIAGNOSTIC");
    expect(out.action).toBe("CLARIFY");
    expect(out.clarify?.question).toMatch(/quel niveau/i);
  });

  it("START_DIAGNOSTIC with level -> ROUTE", () => {
    const out = routePrompt({
      message: "je veux passer un test",
      userProfile: { level: "3e_college" },
    });
    expect(out.intent).toBe("START_DIAGNOSTIC");
    expect(out.action).toBe("ROUTE");
  });

  it("PRACTICE_TOPIC missing topic -> CLARIFY", () => {
    const out = routePrompt({ message: "je veux des exercices" });
    expect(out.intent).toBe("PRACTICE_TOPIC");
    expect(out.action).toBe("CLARIFY");
    expect(out.clarify?.question).toMatch(/quel chapitre/i);
  });

  it("ASK_EXPLANATION with topic -> ROUTE", () => {
    const out = routePrompt({ message: "explique-moi les dérivées" });
    expect(out.intent).toBe("ASK_EXPLANATION");
    expect(out.action).toBe("ROUTE");
  });

  it("CHECK_SOLUTION always CLARIFY to request the solution", () => {
    const out = routePrompt({
      message: "voici ma solution, est-ce correct ?",
    });
    expect(out.intent).toBe("CHECK_SOLUTION");
    expect(out.action).toBe("CLARIFY");
    expect(out.clarify?.question).toMatch(/Envoie ta solution/i);
  });
});

describe("safety: BLOCKED", () => {
  it("blocks inappropriate content", () => {
    const out = routePrompt({
      message: "Explique-moi un truc porno",
    });
    expect(out.action).toBe("BLOCKED");
    expect(out.reasonCode).toBe("inappropriate_content");
  });
});


it("DEBUG: what's happening with CHECK_SOLUTION", () => {
  const raw = "voici ma solution, est-ce correct ?";
  const normalized = normalizePrompt(raw);
  
  console.log("Raw:", raw);
  console.log("Normalized:", normalized);
  console.log("Normalized bytes:", Buffer.from(normalized).toString('hex'));
  
  const intent = detectIntent(normalized);
  console.log("Detected intent:", intent);
  
  // Test patterns directly
  console.log("\nPattern tests:");
  console.log("Has 'solution':", /\b(solution)\b/i.test(normalized));
  console.log("Has 'est-ce' (with hyphen):", /est-ce/i.test(normalized));
  console.log("Has 'est ce' (with space):", /est ce/i.test(normalized));
  console.log("Has 'est[-\\s]?ce':", /est[-\s]?ce/i.test(normalized));
  console.log("Has 'correct':", /\bcorrect\b/i.test(normalized));
});

it("CHECK_SOLUTION always CLARIFY to request the solution", () => {
  const out = routePrompt({
    message: "voici ma solution, est-ce correct ?",
  });
  
  console.log("Full output:", JSON.stringify(out, null, 2));
  
  expect(out.intent).toBe("CHECK_SOLUTION");
  expect(out.action).toBe("CLARIFY");
  expect(out.clarify?.question).toMatch(/Envoie ta solution/i);
});