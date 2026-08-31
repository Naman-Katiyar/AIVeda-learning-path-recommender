export interface RecommendationSignals {
  skillGap: number;
  goalRelevance: number;
  prerequisiteReadiness: number;
  difficultyFit: number;
  preferenceMatch: number;
  historicalPerformance: number;
  resourceFeedback: number;
}
export function scoreRecommendation(signals: RecommendationSignals): number {
  const weights = {
    skillGap: 0.25,
    goalRelevance: 0.2,
    prerequisiteReadiness: 0.15,
    difficultyFit: 0.12,
    preferenceMatch: 0.1,
    historicalPerformance: 0.1,
    resourceFeedback: 0.08,
  };
  const total = Object.entries(weights).reduce(
    (score, [key, weight]) =>
      score + signals[key as keyof RecommendationSignals] * weight,
    0,
  );
  return Math.round(Math.max(0, Math.min(100, total)));
}
export function isPrerequisiteReady(
  prerequisites: string[],
  completedSkills: string[],
): boolean {
  const completed = new Set(
    completedSkills.map((skill) => skill.toLowerCase()),
  );
  return prerequisites.every((item) => completed.has(item.toLowerCase()));
}
