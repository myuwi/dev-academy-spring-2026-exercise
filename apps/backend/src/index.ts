import { Hono } from "hono";
import stats from "./routes/stats";

const app = new Hono();

app.route("/stats", stats);

export default app;
