import { describe, it, expect } from "vitest";
import { normalizePrompt, isLikelyFrench } from "../../src/core/normalize";

describe("normalizePrompt", () => {
  it("collapses spaces and normalizes digits", () => {
    const s = "  Bonjour\u00A0  ١٢٣  ";
    expect(normalizePrompt(s)).toBe("Bonjour 123");
  });
});

describe("isLikelyFrench", () => {
  it("accepts obvious French", () => {
    expect(isLikelyFrench("Explique-moi les équations du 2nd degré")).toBe(true);
  });
  it("passes very short strings (not blocking)", () => {
    expect(isLikelyFrench("ok")).toBe(true);
  });
  it("rejects clear English text", () => {
    expect(isLikelyFrench("please explain quadratic equations")).toBe(false);
  });
});
