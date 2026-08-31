import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { fileURLToPath } from "node:url";
import { aiProvider } from "./services/ai/provider.js";
import {
  activities,
  goals,
  paths,
  profiles,
  seedPath,
  generatePersonalizedPath,
  users,
  id,
  now,
  persistActivity,
  persistGoal,
  persistPath,
  persistProfile,
  persistUser,
} from "./services/store.js";
import { requireAuth, signToken, type AuthRequest } from "./middleware/auth.js";

const app = express();
const clientDistPath = fileURLToPath(
  new URL("../../client/dist", import.meta.url),
);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL ?? "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));

if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientDistPath));
}

const credentials = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z
    .string()
    .email()
    .transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
});
const goalInput = z.object({ goal: z.string().trim().min(3).max(500) });
const profileInput = z.object({
  occupation: z.string().max(100).optional(),
  education: z.string().max(100).optional(),
  experience: z.string().max(50).optional(),
  interests: z.array(z.string().max(50)).max(20).optional(),
  skills: z
    .array(
      z.object({
        name: z.string().max(60),
        proficiency: z.number().min(0).max(100),
      }),
    )
    .max(50)
    .optional(),
  preferences: z
    .object({
      hoursPerWeek: z.number().min(1).max(80),
      learningStyle: z.string().max(80),
      resourceType: z.string().max(80),
      difficulty: z.string().max(40),
      targetDate: z.string().optional(),
    })
    .optional(),
});
const progressInput = z.object({
  status: z.enum(["in_progress", "completed", "available"]),
  confidence: z.number().min(0).max(100).optional(),
});

const ok = (res: express.Response, data: unknown, status = 200) =>
  res.status(status).json({ success: true, data });
const fail = (
  res: express.Response,
  message: string,
  errorCode: string,
  status = 400,
) => res.status(status).json({ success: false, message, errorCode });
const currentUser = (req: AuthRequest) =>
  users.find((user) => user.id === req.userId);

app.get("/api/health", (_req, res) =>
  ok(res, {
    service: "aiveda-api",
    status: "ok",
    persistence: process.env.MONGODB_URI ? "configured" : "requires-mongodb",
  }),
);
app.post("/api/auth/register", async (req, res) => {
  const parsed = credentials.safeParse(req.body);
  if (!parsed.success)
    return fail(
      res,
      "Use a valid email and a password of at least 8 characters.",
      "VALIDATION_ERROR",
    );
  if (users.some((user) => user.email === parsed.data.email))
    return fail(
      res,
      "An account with that email already exists.",
      "EMAIL_EXISTS",
      409,
    );
  const user = {
    id: id(),
    name: parsed.data.name ?? "New learner",
    email: parsed.data.email,
    passwordHash: await bcrypt.hash(parsed.data.password, 12),
    role: "learner" as const,
    createdAt: now(),
  };
  users.push(user);
  await persistUser(user);
  profiles.push({
    userId: user.id,
    occupation: "",
    education: "",
    experience: "Beginner",
    interests: [],
    skills: [],
    preferences: {
      hoursPerWeek: 5,
      learningStyle: "Hands-on projects",
      resourceType: "Video + docs",
      difficulty: "Balanced",
    },
  });
  await persistProfile(profiles[profiles.length - 1]);
  return ok(
    res,
    {
      token: signToken(user.id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
    201,
  );
});
app.post("/api/auth/login", async (req, res) => {
  const parsed = credentials
    .pick({ email: true, password: true })
    .safeParse(req.body);
  if (!parsed.success)
    return fail(res, "Enter your email and password.", "VALIDATION_ERROR");
  const user = users.find((candidate) => candidate.email === parsed.data.email);
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash)))
    return fail(
      res,
      "Email or password is incorrect.",
      "INVALID_CREDENTIALS",
      401,
    );
  return ok(res, {
    token: signToken(user.id),
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});
app.post("/api/auth/logout", (_req, res) => ok(res, { loggedOut: true }));
app.get("/api/auth/me", requireAuth, (req: AuthRequest, res) => {
  const user = currentUser(req);
  return user
    ? ok(res, {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      })
    : fail(res, "User not found.", "USER_NOT_FOUND", 404);
});
app.get("/api/profile", requireAuth, (req: AuthRequest, res) =>
  ok(res, profiles.find((profile) => profile.userId === req.userId) ?? null),
);
app.put("/api/profile", requireAuth, async (req: AuthRequest, res) => {
  const parsed = profileInput.safeParse(req.body);
  if (!parsed.success)
    return fail(res, "Profile data is invalid.", "VALIDATION_ERROR");
  const profile = profiles.find((candidate) => candidate.userId === req.userId);
  if (!profile)
    return fail(res, "Profile not found.", "PROFILE_NOT_FOUND", 404);
  Object.assign(profile, parsed.data);
  await persistProfile(profile);
  return ok(res, profile);
});
app.post("/api/goals", requireAuth, async (req: AuthRequest, res) => {
  const parsed = goalInput.safeParse(req.body);
  if (!parsed.success)
    return fail(
      res,
      "Please describe a goal in at least 3 characters.",
      "VALIDATION_ERROR",
    );
  const analysis = await aiProvider.analyzeGoal(parsed.data.goal);
  const goal = {
    id: id(),
    userId: req.userId!,
    text: parsed.data.goal,
    analysis,
    createdAt: now(),
  };
  goals.push(goal);
  await persistGoal(goal);
  const userProfile = profiles.find((p) => p.userId === req.userId);
  const createdPath = generatePersonalizedPath(
    req.userId!,
    goal.id,
    userProfile,
    analysis,
    parsed.data.goal,
  );
  await persistPath(createdPath);
  return ok(res, goal, 201);
});
app.get("/api/goals", requireAuth, (req: AuthRequest, res) =>
  ok(
    res,
    goals.filter((goal) => goal.userId === req.userId),
  ),
);
app.post("/api/ai/analyze-goal", async (req, res) => {
  const parsed = goalInput.safeParse(req.body);
  if (!parsed.success)
    return fail(res, "Please enter a learning goal.", "VALIDATION_ERROR");
  return ok(res, await aiProvider.analyzeGoal(parsed.data.goal));
});
app.post("/api/ai/chat", requireAuth, async (req: AuthRequest, res) => {
  const input = z
    .object({
      question: z.string().trim().min(1).max(2000),
      currentTopic: z.string().max(100).optional(),
    })
    .safeParse(req.body);
  if (!input.success)
    return fail(res, "Ask a question to continue.", "VALIDATION_ERROR");
  const goal = goals.find((candidate) => candidate.userId === req.userId);
  return ok(res, {
    answer: await aiProvider.answerLearningQuestion(input.data.question, {
      currentTopic: input.data.currentTopic,
      goal: goal?.analysis.careerGoal,
    }),
  });
});
app.get("/api/paths", requireAuth, (req: AuthRequest, res) =>
  ok(
    res,
    paths.filter((path) => path.userId === req.userId),
  ),
);
app.get("/api/paths/:id", requireAuth, (req: AuthRequest, res) => {
  const path = paths.find(
    (candidate) =>
      candidate.id === req.params.id && candidate.userId === req.userId,
  );
  return path
    ? ok(res, path)
    : fail(res, "Learning path not found.", "RESOURCE_NOT_FOUND", 404);
});
app.post("/api/paths/generate", requireAuth, async (req: AuthRequest, res) => {
  const goal = goals.find((candidate) => candidate.userId === req.userId);
  if (!goal)
    return fail(
      res,
      "Create a goal before generating a path.",
      "GOAL_REQUIRED",
    );
  const userProfile = profiles.find((p) => p.userId === req.userId);
  const path = generatePersonalizedPath(
    req.userId!,
    goal.id,
    userProfile,
    goal.analysis,
    goal.text,
  );
  await persistPath(path);
  return ok(res, path);
});
app.put("/api/progress/:itemId", requireAuth, async (req: AuthRequest, res) => {
  const parsed = progressInput.safeParse(req.body);
  if (!parsed.success)
    return fail(res, "Progress update is invalid.", "VALIDATION_ERROR");
  const path = paths.find(
    (candidate) =>
      candidate.userId === req.userId &&
      candidate.items.some((item) => item.id === req.params.itemId),
  );
  if (!path)
    return fail(res, "Learning item not found.", "RESOURCE_NOT_FOUND", 404);
  const item = path.items.find(
    (candidate) => candidate.id === req.params.itemId,
  )!;
  if (item.status === "locked")
    return fail(
      res,
      "Complete the prerequisites first.",
      "PREREQUISITES_INCOMPLETE",
      409,
    );
  item.status = parsed.data.status;
  path.progress = Math.round(
    (path.items.filter((candidate) => candidate.status === "completed").length /
      path.items.length) *
      100,
  );
  activities.unshift({
    id: id(),
    userId: req.userId!,
    type: item.status,
    title: `${item.title} marked ${item.status.replace("_", " ")}`,
    createdAt: now(),
  });
  await persistPath(path);
  await persistActivity(activities[0]);
  return ok(res, { item, progress: path.progress });
});
app.get("/api/recommendations", requireAuth, (req: AuthRequest, res) => {
  const path = paths.find((candidate) => candidate.userId === req.userId);
  return ok(
    res,
    path?.items
      .filter(
        (item) => item.status === "available" || item.status === "in_progress",
      )
      .map((item) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        estimatedHours: item.estimatedHours,
        skill: item.skill,
        score: item.status === "in_progress" ? 94 : 88,
        reason: item.reason,
      })) ?? [],
  );
});
app.get("/api/analytics/dashboard", requireAuth, (req: AuthRequest, res) => {
  const path = paths.find((candidate) => candidate.userId === req.userId);
  const userActivities = activities
    .filter((activity) => activity.userId === req.userId)
    .slice(0, 10);

  // Calculate real metrics from user's actual progress
  const completedItems =
    path?.items.filter((item) => item.status === "completed") ?? [];
  const hoursLearned = completedItems.reduce(
    (sum, item) => sum + item.estimatedHours,
    0,
  );

  return ok(res, {
    overallProgress: path?.progress ?? 0,
    currentStreak: userActivities.length > 0 ? 1 : 0, // Real streak calculation would require timestamp analysis
    hoursLearned,
    completedTopics: completedItems.length,
    recentActivity: userActivities,
  });
});
app.get("/api/analytics/activity", requireAuth, (req: AuthRequest, res) =>
  ok(
    res,
    activities
      .filter((activity) => activity.userId === req.userId)
      .slice(0, 50),
  ),
);
app.get(/^(?!\/api).+/, (_req, res) => {
  if (process.env.NODE_ENV === "production") {
    res.sendFile(`${clientDistPath}/index.html`);
    return;
  }
  fail(res, "Resource not found", "RESOURCE_NOT_FOUND", 404);
});

app.use((_req, res) =>
  fail(res, "Resource not found", "RESOURCE_NOT_FOUND", 404),
);
app.use(
  (
    error: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(error.message);
    return fail(res, "Something went wrong", "INTERNAL_ERROR", 500);
  },
);
export default app;
