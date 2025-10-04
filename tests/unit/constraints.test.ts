import { describe, it, expect } from "vitest";
import { extractConstraints, parseDuration } from "../../src/core/constraints";
import { routePrompt } from "../../src/index";

describe("parseDuration", () => {
  it("parses minutes", () => {
    expect(parseDuration("30 min")).toBe("30min");
    expect(parseDuration("45m")).toBe("45min");
  });
  it("parses hours and hours+minutes to minutes", () => {
    expect(parseDuration("1h")).toBe("60min");
    expect(parseDuration("1 h 20")).toBe("80min");
    expect(parseDuration("2h30")).toBe("150min");
  });
  it("returns null when absent", () => {
    expect(parseDuration("pas de durée mentionnée")).toBeNull();
  });
});

describe("extractConstraints", () => {
  it("difficulty and indices", () => {
    const c = extractConstraints("un exercice difficile sans indices en 30 min");
    expect(c.difficulte).toBe("difficile");
    expect(c.indices).toBe("non");
    expect(c.duree).toBe("30min");
  });
  it("defaults when not specified", () => {
    const c = extractConstraints("Je veux un cours sur les dérivées");
    expect(c.difficulte).toBe("auto");
    expect(c.indices).toBe("oui");
    expect(c.duree).toBeNull();
  });
});

describe("router integrates constraints", () => {
  it("fills constraints in output", () => {
    const out = routePrompt({
      message:
        "Donne-moi des exercices niveau moyen sur le discriminant en 1h, sans indices",
    });
    expect(out.constraints.difficulte).toBe("moyen");
    expect(out.constraints.duree).toBe("60min"); // normalized
    expect(out.constraints.indices).toBe("non");
  });
});
