import { describe, it, expect } from "vitest";
import { routePrompt } from "../../src/index";

describe("FR-only gate in routePrompt", () => {
  it("returns UNSUPPORTED_LANGUAGE for clear English", () => {
    const out = routePrompt({ message: "I want exercises on derivatives" });
    expect(out.action).toBe("UNSUPPORTED_LANGUAGE");
    expect(out.language).toBe("non_fr");
  });

  it("routes when French + enough info", () => {
    const out = routePrompt({ message: "je veux des exercices sur les dérivées" });
    expect(out.action).toBe("ROUTE");       // updated: we now route with enough info
    expect(out.language).toBe("fr");
  });
});
