import { describe, it, expect } from "vitest";
import { routePrompt } from "../../src/index";

describe("smoke", () => {
  it("routePrompt returns a valid shape", () => {
    const out = routePrompt({ message: "test" });
    expect(out).toHaveProperty("action");
    expect(out).toHaveProperty("constraints");
  });
});
