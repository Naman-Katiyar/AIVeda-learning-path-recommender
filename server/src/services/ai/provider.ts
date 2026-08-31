import { z } from "zod";

const goalAnalysisSchema = z.object({
  careerGoal: z.string().min(2),
  targetSkills: z.array(z.string()).min(1),
  estimatedDifficulty: z.enum(["beginner", "intermediate", "advanced"]),
  suggestedDurationWeeks: z.number().int().positive(),
});
type GoalAnalysis = z.infer<typeof goalAnalysisSchema>;

export interface AIProvider {
  analyzeGoal(goal: string): Promise<GoalAnalysis>;
  answerLearningQuestion(
    question: string,
    context: { currentTopic?: string; goal?: string },
  ): Promise<string>;
}

export class MockAIProvider implements AIProvider {
  async analyzeGoal(goal: string) {
    const text = goal.toLowerCase();
    const result = {
      careerGoal: text.includes("data")
        ? "Data Scientist"
        : text.includes("machine")
          ? "AI / ML Engineer"
          : text.includes("cloud")
            ? "Cloud Engineer"
            : "Full Stack Developer",
      targetSkills:
        text.includes("data") || text.includes("machine")
          ? ["Python", "Statistics", "Machine Learning", "Data Visualization"]
          : [
              "JavaScript",
              "React",
              "Node.js",
              "REST APIs",
              "MongoDB",
              "Authentication",
            ],
      estimatedDifficulty: "intermediate" as const,
      suggestedDurationWeeks: 20,
    };
    return goalAnalysisSchema.parse(result);
  }
  async answerLearningQuestion(
    question: string,
    context: { currentTopic?: string; goal?: string },
  ) {
    if (/faster|hours|time/i.test(question))
      return "I can compress your plan by focusing on the highest-impact prerequisite first, then turning the next concept into a practical project. Your current best next step is Async programming.";
    return `For your ${context.goal ?? "learning goal"}, focus on ${context.currentTopic ?? "the next available roadmap item"} and practice it with a small project. Ask me to adapt your pace whenever your schedule changes.`;
  }
}

/**
 * Google Gemini AI Provider
 * Provides real AI-powered goal analysis and learning assistance
 * Free tier: 60 requests/minute at aistudio.google.com
 */
export class GeminiAIProvider implements AIProvider {
  private apiKey: string;
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta/models";
  private model: string;

  constructor(apiKey: string, model = "gemini-3.6-flash") {
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY or AI_API_KEY environment variable is required for Gemini provider",
      );
    }
    this.apiKey = apiKey;
    this.model = model;
  }

  async analyzeGoal(goal: string): Promise<GoalAnalysis> {
    const prompt = `You are a learning path advisor. Analyze this learning goal and respond with ONLY a JSON object (no markdown, no code blocks):

Goal: "${goal}"

Respond with exactly this JSON structure:
{
  "careerGoal": "the target career/role based on the goal",
  "targetSkills": ["skill1", "skill2", "skill3", "skill4"],
  "estimatedDifficulty": "beginner or intermediate or advanced",
  "suggestedDurationWeeks": number between 4 and 52
}

Rules:
- careerGoal: specific role name (2+ words)
- targetSkills: 4-6 relevant skills for this goal
- estimatedDifficulty: based on goal complexity
- suggestedDurationWeeks: estimate how many weeks this goal takes to accomplish`;

    try {
      const response = await fetch(
        `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 1,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Gemini API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

      // Extract JSON from response (handle markdown code blocks)
      let jsonText = textContent;
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonText);
      return goalAnalysisSchema.parse(parsed);
    } catch (error) {
      console.error("Gemini goal analysis error:", error);
      // Fallback to mock provider on error
      return new MockAIProvider().analyzeGoal(goal);
    }
  }

  async answerLearningQuestion(
    question: string,
    context: { currentTopic?: string; goal?: string },
  ): Promise<string> {
    const prompt = `You are a helpful learning assistant. A student learning to become a ${context.goal ?? "developer"} is asking for help.

Current topic: ${context.currentTopic ?? "General"}
Question: "${question}"

Provide a concise, encouraging response (2-3 sentences max). Focus on actionable advice. Be conversational and supportive.`;

    try {
      const response = await fetch(
        `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 256,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          `Gemini API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      return (
        data.candidates?.[0]?.content?.parts?.[0]?.text ??
        "I couldn't generate a response. Please try again."
      );
    } catch (error) {
      console.error("Gemini question answer error:", error);
      // Fallback to mock provider on error
      return new MockAIProvider().answerLearningQuestion(question, context);
    }
  }
}

// Factory function to create appropriate provider based on environment
export function createAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER?.toLowerCase() ?? "mock";
  const apiKey = process.env.AI_API_KEY ?? process.env.GEMINI_API_KEY ?? "";
  const model = process.env.AI_MODEL ?? "gemini-2.0-flash";

  if (provider === "gemini") {
    return new GeminiAIProvider(apiKey ?? "", model);
  }

  if (provider === "mock") {
    return new MockAIProvider();
  }

  console.warn(
    `Unknown AI provider: ${provider}, falling back to mock provider`,
  );
  return new MockAIProvider();
}

export const aiProvider: AIProvider = createAIProvider();
