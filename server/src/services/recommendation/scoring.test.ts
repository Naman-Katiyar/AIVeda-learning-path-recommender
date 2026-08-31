import { describe, expect, it } from "vitest";
import { isPrerequisiteReady, scoreRecommendation } from "./scoring.js";

describe("recommendation scoring", () => {
  it("weights a strong personalized match highly", () => {
    expect(
      scoreRecommendation({
        skillGap: 100,
        goalRelevance: 95,
        prerequisiteReadiness: 100,
        difficultyFit: 90,
        preferenceMatch: 80,
        historicalPerformance: 70,
        resourceFeedback: 90,
      }),
    ).toBe(92);
  });
  it("requires every prerequisite before unlocking an item", () => {
    expect(
      isPrerequisiteReady(["JavaScript", "Async"], ["javascript", "async"]),
    ).toBe(true);
    expect(isPrerequisiteReady(["JavaScript", "Async"], ["JavaScript"])).toBe(
      false,
    );
  });
});
