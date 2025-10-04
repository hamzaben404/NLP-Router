import { describe, it, expect } from "vitest";
import { extractSlots } from "../../src/core/slots";
import { routePrompt } from "../../src/index";

describe("extractSlots", () => {
  it("finds format=exercice and topic=subtopic for 2nd degree", () => {
    const s = "Je veux des exercices sur les équations du 2nd degré, surtout le discriminant.";
    const slots = extractSlots(s);
    expect(slots.format).toBe("exercice");
    expect(slots.topic).toBe("equations_second_degre");
    expect(slots.subtopic).toBe("discriminant");
  });

  it("detects level alias", () => {
    const s = "Exercices 3e collège sur les dérivées.";
    const slots = extractSlots(s);
    expect(slots.level).toBe("3e_college");
    expect(slots.topic).toBe("derivees");
    expect(slots.format).toBe("exercice");
  });

  it("finds qcm request", () => {
    const s = "Donne-moi un QCM sur la géométrie analytique";
    const slots = extractSlots(s);
    expect(slots.format).toBe("qcm");
    expect(slots.topic).toBe("geometrie_analytique");
  });
});

describe("routePrompt fills slots and routes when sufficient info", () => {
  it("propagates slots into the output and ROUTEs", () => {
    const out = routePrompt({
      message: "Je veux des exercices sur le discriminant en équations du 2nd degré",
    });
    expect(out.action).toBe("ROUTE"); // updated: route when enough info
    expect(out.language).toBe("fr");
    expect(out.topic).toBe("equations_second_degre");
    expect(out.subtopic).toBe("discriminant");
    expect(out.format).toBe("exercice");
  });
});
