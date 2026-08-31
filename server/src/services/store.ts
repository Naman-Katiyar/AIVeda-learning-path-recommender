import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import {
  ActivityModel,
  GoalModel,
  PathModel,
  ProfileModel,
  UserModel,
} from "../config/database.js";

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "learner" | "admin";
  createdAt: string;
};
export type Profile = {
  userId: string;
  occupation: string;
  education: string;
  experience: string;
  interests: string[];
  skills: { name: string; proficiency: number }[];
  preferences: {
    hoursPerWeek: number;
    learningStyle: string;
    resourceType: string;
    difficulty: string;
    targetDate?: string;
  };
};
export type Goal = {
  id: string;
  userId: string;
  text: string;
  analysis: {
    careerGoal: string;
    targetSkills: string[];
    estimatedDifficulty: "beginner" | "intermediate" | "advanced";
    suggestedDurationWeeks: number;
  };
  createdAt: string;
};
export type PathItem = {
  id: string;
  title: string;
  description: string;
  type: "course" | "topic" | "project" | "assessment" | "milestone";
  difficulty: string;
  estimatedHours: number;
  skill: string;
  prerequisites: string[];
  status: "locked" | "available" | "in_progress" | "completed";
  reason: string;
};
export type Path = {
  id: string;
  userId: string;
  goalId: string;
  title: string;
  progress: number;
  items: PathItem[];
  updatedAt: string;
};

const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();
const safeIsoDate = (value: unknown, fallback = now()) => {
  if (value === null || value === undefined || value === "") return fallback;
  const date = new Date(value as string | number | Date);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toISOString();
};
export const users: User[] = [];
export const profiles: Profile[] = [];
export const goals: Goal[] = [];
export const paths: Path[] = [];
export const activities: {
  id: string;
  userId: string;
  type: string;
  title: string;
  createdAt: string;
}[] = [];

export async function hydrateStore() {
  if (UserModel.db.readyState !== 1) return;
  const [
    storedUsers,
    storedProfiles,
    storedGoals,
    storedPaths,
    storedActivities,
  ] = await Promise.all([
    UserModel.find().lean(),
    ProfileModel.find().lean(),
    GoalModel.find().lean(),
    PathModel.find().lean(),
    ActivityModel.find().sort({ createdAt: -1 }).lean(),
  ]);
  users.push(
    ...storedUsers.map((user) => ({
      id: user._id as string,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role as User["role"],
      createdAt: safeIsoDate(user.createdAt),
    })),
  );
  profiles.push(
    ...storedProfiles.map(
      (profile) =>
        ({
          userId: profile.userId,
          occupation: profile.occupation ?? "",
          education: profile.education ?? "",
          experience: profile.experience ?? "",
          interests: profile.interests ?? [],
          skills: profile.skills ?? [],
          preferences: profile.preferences,
        }) as Profile,
    ),
  );
  goals.push(
    ...storedGoals.map((goal) => ({
      id: goal._id as string,
      userId: goal.userId,
      text: goal.text ?? "",
      analysis: goal.analysis as Goal["analysis"],
      createdAt: safeIsoDate(goal.createdAt),
    })),
  );
  paths.push(
    ...storedPaths.map((path) => ({
      id: path._id as string,
      userId: path.userId,
      goalId: path.goalId ?? "",
      title: path.title ?? "Learning path",
      progress: path.progress ?? 0,
      items: path.items as PathItem[],
      updatedAt: safeIsoDate(path.updatedAt),
    })),
  );
  activities.push(
    ...storedActivities.map((activity) => ({
      id: activity._id as string,
      userId: activity.userId,
      type: activity.type ?? "activity",
      title: activity.title ?? "Learning activity",
      createdAt: safeIsoDate(activity.createdAt),
    })),
  );
}
export async function persistUser(user: User) {
  if (UserModel.db.readyState === 1)
    await UserModel.findByIdAndUpdate(user.id, user, {
      upsert: true,
      setDefaultsOnInsert: true,
    });
}
export async function persistProfile(profile: Profile) {
  if (ProfileModel.db.readyState === 1)
    await ProfileModel.findOneAndUpdate(
      { userId: profile.userId },
      { _id: profile.userId, ...profile },
      { upsert: true, setDefaultsOnInsert: true },
    );
}
export async function persistGoal(goal: Goal) {
  if (GoalModel.db.readyState === 1)
    await GoalModel.findByIdAndUpdate(
      goal.id,
      { _id: goal.id, ...goal },
      { upsert: true, setDefaultsOnInsert: true },
    );
}
export async function persistPath(path: Path) {
  if (PathModel.db.readyState === 1)
    await PathModel.findByIdAndUpdate(
      path.id,
      { _id: path.id, ...path },
      { upsert: true, setDefaultsOnInsert: true },
    );
}
export async function persistActivity(activity: (typeof activities)[number]) {
  if (ActivityModel.db.readyState === 1)
    await ActivityModel.findByIdAndUpdate(
      activity.id,
      { _id: activity.id, ...activity },
      { upsert: true, setDefaultsOnInsert: true },
    );
}

export async function ensureDemoUser() {
  // Production: Do NOT auto-seed demo users
  // Demo users must be explicitly created via registration endpoint
  return null;
}

export async function initializeStore() {
  await hydrateStore();
  // Removed automatic demo user seeding - users must register or be created intentionally
}

/**
 * Curriculum database: Maps skills to learning progressions
 * Each entry defines foundation, intermediate, and advanced topics
 */
const CURRICULUM_DATABASE: Record<
  string,
  {
    foundation: string[];
    intermediate: string[];
    advanced: string[];
  }
> = {
  JavaScript: {
    foundation: [
      "Variables & Data Types",
      "Functions & Scope",
      "DOM Manipulation",
    ],
    intermediate: ["Async/Await & Promises", "Closures & Modules"],
    advanced: ["Performance Optimization", "Memory Management"],
  },
  Python: {
    foundation: ["Variables & Data Types", "Functions & Loops"],
    intermediate: ["Object-Oriented Programming", "List Comprehensions"],
    advanced: ["Decorators & Metaclasses", "Async Python"],
  },
  React: {
    foundation: [
      "Components & JSX",
      "Props & State",
      "Hooks Basics (useState)",
    ],
    intermediate: ["Effect Hook & Lifecycle", "Context API", "Custom Hooks"],
    advanced: ["Performance Optimization", "Advanced Patterns"],
  },
  "Node.js": {
    foundation: ["Modules & NPM", "File System", "Event Emitter"],
    intermediate: ["Express Framework", "Middleware Pattern"],
    advanced: ["Clustering", "Worker Threads"],
  },
  MongoDB: {
    foundation: ["Document Model", "CRUD Operations", "Queries"],
    intermediate: ["Aggregation", "Indexing", "Transactions"],
    advanced: ["Optimization", "Replication", "Sharding"],
  },
  "System Design": {
    foundation: ["Scalability Basics", "Load Balancing"],
    intermediate: ["Database Design", "Caching Strategies"],
    advanced: ["Distributed Systems", "Microservices"],
  },
};

/**
 * Generate a personalized learning path based on user profile and goal
 * For now, delegates to seedPath. Full personalization coming soon.
 */
export function generatePersonalizedPath(
  userId: string,
  goalId: string,
  _userProfile: Profile | undefined,
  goalAnalysis: Goal["analysis"],
  _goalText: string,
): Path {
  const existing = paths.find(
    (path) => path.userId === userId && path.goalId === goalId,
  );
  if (existing) return existing;

  // For now, use seedPath to create the path
  // In future iterations, this will be enhanced with real personalization logic
  return seedPath(userId, goalId, goalAnalysis.careerGoal);
}

export function seedPath(
  userId: string,
  goalId: string,
  title = "Full Stack Developer",
) {
  const existing = paths.find(
    (path) => path.userId === userId && path.goalId === goalId,
  );
  if (existing) return existing;
  const items: PathItem[] = [
    [
      "JavaScript fundamentals",
      "Build fluency with modern syntax and core mental models.",
      "course",
      "Foundational",
      8,
      "JavaScript",
      [],
      "completed",
      "A strong foundation for every next step.",
    ],
    [
      "Advanced JavaScript",
      "Deepen your understanding of closures, modules, and performance.",
      "topic",
      "Intermediate",
      10,
      "JavaScript",
      ["JavaScript fundamentals"],
      "completed",
      "A bridge between your current confidence and backend work.",
    ],
    [
      "Async programming",
      "Learn promises, async/await, event loops, and reliable errors.",
      "topic",
      "Intermediate",
      6,
      "JavaScript",
      ["Advanced JavaScript"],
      "in_progress",
      "Your next prerequisite for Node.js.",
    ],
    [
      "Node.js foundations",
      "Move JavaScript beyond the browser and build server programs.",
      "course",
      "Intermediate",
      12,
      "Node.js",
      ["Async programming"],
      "available",
      "Your highest-impact current skill gap.",
    ],
    [
      "Express and REST APIs",
      "Design clean endpoints, middleware, and error responses.",
      "course",
      "Intermediate",
      10,
      "REST APIs",
      ["Node.js foundations"],
      "locked",
      "Unlocks after Node.js foundations.",
    ],
    [
      "Production API capstone",
      "Ship a secure, tested API with persistence and deployment.",
      "project",
      "Advanced",
      18,
      "System design",
      ["Express and REST APIs"],
      "locked",
      "A portfolio proof point for your target role.",
    ],
  ].map(
    ([
      itemTitle,
      description,
      type,
      difficulty,
      estimatedHours,
      skill,
      prerequisites,
      status,
      reason,
    ]) => ({
      id: id(),
      title: itemTitle as string,
      description: description as string,
      type: type as PathItem["type"],
      difficulty: difficulty as string,
      estimatedHours: estimatedHours as number,
      skill: skill as string,
      prerequisites: prerequisites as string[],
      status: status as PathItem["status"],
      reason: reason as string,
    }),
  );
  const path = {
    id: id(),
    userId,
    goalId,
    title,
    progress: 34,
    items,
    updatedAt: now(),
  };
  paths.push(path);
  return path;
}
export function unlockPath(path: Path) {
  const completed = new Set(
    path.items
      .filter((item) => item.status === "completed")
      .map((item) => item.title.toLowerCase()),
  );
  path.items.forEach((item) => {
    if (
      item.status === "locked" &&
      item.prerequisites.every((prerequisite) =>
        completed.has(prerequisite.toLowerCase()),
      )
    )
      item.status = "available";
  });
  path.progress = Math.round(
    (path.items.filter((item) => item.status === "completed").length /
      path.items.length) *
      100,
  );
  path.updatedAt = now();
  return path;
}
export { id, now };
