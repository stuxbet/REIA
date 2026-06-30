import { serve } from "@hono/node-server";
import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();
app.use("*", cors());

app.get("/health", (c) =>
  c.json({ ok: true, service: "reia-server", rentcast: Boolean(process.env.RENTCAST_API_KEY) }),
);

const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`reia-server listening on :${info.port}`);
});

export default app;
