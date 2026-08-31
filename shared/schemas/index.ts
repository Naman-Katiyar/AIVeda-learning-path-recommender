import { z } from 'zod';
export const goalAnalysisSchema = z.object({ careerGoal: z.string().min(2), targetSkills: z.array(z.string()).min(1), estimatedDifficulty: z.enum(['beginner', 'intermediate', 'advanced']), suggestedDurationWeeks: z.number().int().positive() });
export const progressUpdateSchema = z.object({ itemId: z.string().min(1), status: z.enum(['available', 'in_progress', 'completed']), confidence: z.number().min(0).max(100).optional() });
export type GoalAnalysis = z.infer<typeof goalAnalysisSchema>;
