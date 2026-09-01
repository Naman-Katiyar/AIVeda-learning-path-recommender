import mongoose, { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    _id: String,
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["learner", "admin"], default: "learner" },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);
const profileSchema = new Schema(
  {
    _id: String,
    userId: { type: String, required: true, unique: true, index: true },
    occupation: String,
    education: String,
    experience: String,
    interests: [String],
    skills: [{ name: String, proficiency: Number }],
    preferences: {
      hoursPerWeek: Number,
      learningStyle: String,
      resourceType: String,
      difficulty: String,
      targetDate: String,
    },
  },
  { versionKey: false },
);
const goalSchema = new Schema(
  {
    _id: String,
    userId: { type: String, required: true, index: true },
    text: String,
    analysis: Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);
const pathSchema = new Schema(
  {
    _id: String,
    userId: { type: String, required: true, index: true },
    goalId: String,
    title: String,
    progress: Number,
    items: [Schema.Types.Mixed],
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);
const activitySchema = new Schema(
  {
    _id: String,
    userId: { type: String, required: true, index: true },
    type: String,
    title: String,
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);
export const UserModel = model("User", userSchema);
export const ProfileModel = model("LearnerProfile", profileSchema);
export const GoalModel = model("Goal", goalSchema);
export const PathModel = model("LearningPath", pathSchema);
export const ActivityModel = model("Activity", activitySchema);

export async function ensureUserCollectionCompatibility() {
  if (mongoose.connection.readyState !== 1) return;

  const usersCollection = mongoose.connection.collection("users");

  try {
    await usersCollection.dropIndex("username_1");
  } catch (error: any) {
    if (error?.code !== 26) {
      console.warn(
        "Unable to drop legacy username index:",
        error.message ?? error,
      );
    }
  }

  try {
    await usersCollection.createIndex(
      { email: 1 },
      { unique: true, background: true },
    );
  } catch (error: any) {
    if (error?.code !== 11000) {
      console.warn("Unable to ensure email index:", error.message ?? error);
    }
  }
}

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn(
      "MONGODB_URI is not set; this app requires a MongoDB connection for real SaaS data persistence.",
    );
    return false;
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: 10,
  });
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
  await ensureUserCollectionCompatibility();
  return true;
}
export async function disconnectDatabase() {
  await mongoose.disconnect();
}
