import { Hono } from "hono";
import { logger } from "hono/logger";
import stats from "./routes/stats";

const app = new Hono();

app.use(logger());
app.route("/stats", stats);

// Handle shutdown gracefully
const shutdown = async () => {
  console.info("Shutting down server...");
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

export default app;
