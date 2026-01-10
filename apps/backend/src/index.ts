import { Hono } from "hono";
import { logger } from "hono/logger";
import stats from "./routes/stats";

const app = new Hono();

app.use(logger());
app.route("/stats", stats);

export default app;
