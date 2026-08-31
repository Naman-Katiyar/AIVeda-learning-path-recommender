import "dotenv/config";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { initializeStore } from "./services/store.js";

try {
  const connected = await connectDatabase();
  if (!connected)
    throw new Error("MONGODB_URI is required to seed persistent data.");
  await initializeStore();
  console.log("AIVeda data seeded successfully.");
  await disconnectDatabase();
} catch (error) {
  console.error("Unable to seed AIVeda data.", error);
  process.exit(1);
}
