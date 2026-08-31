import "dotenv/config";
import { connectDatabase } from "./config/database.js";
import { initializeStore } from "./services/store.js";

const port = Number(process.env.PORT ?? 5000);
try {
  await connectDatabase();
  await initializeStore();
  const { default: app } = await import("./app.js");
  app.listen(port, "0.0.0.0", () =>
    console.log(`AIVeda API listening on 0.0.0.0:${port}`),
  );
} catch (error) {
  console.error("Unable to start AIVeda API", error);
  process.exit(1);
}
