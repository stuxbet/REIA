import { serve } from "@hono/node-server";
import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { enrichAddress, HttpError } from "./rentcast";

const app = new Hono();
// Native app sends no Origin (CORS is a browser concern); lock it down for the
// web build / defense-in-depth when ALLOWED_ORIGIN is set.
app.use("*", cors({ origin: process.env.ALLOWED_ORIGIN ?? "*" }));

app.get("/health", (c) =>
  c.json({ ok: true, service: "reia-server", rentcast: Boolean(process.env.RENTCAST_API_KEY) }),
);

// One call = one of the account's monthly RentCast requests. The app gates
// this behind an explicit, confirmed button — do not call it casually.
app.get("/enrich", async (c) => {
  // Auth: this endpoint spends a metered third-party request, so require a
  // shared secret. Fail closed if the server has none configured.
  const secret = process.env.API_SHARED_SECRET;
  if (!secret) return c.json({ error: "server missing API_SHARED_SECRET" }, 500);
  if (c.req.header("authorization") !== `Bearer ${secret}`) return c.json({ error: "unauthorized" }, 401);

  const address = c.req.query("address");
  if (!address) return c.json({ error: "missing ?address" }, 400);
  const key = process.env.RENTCAST_API_KEY;
  if (!key) return c.json({ error: "server missing RENTCAST_API_KEY" }, 500);
  try {
    return c.json(await enrichAddress(address, key));
  } catch (e) {
    if (e instanceof HttpError) return c.json({ error: e.message }, e.status as 400);
    return c.json({ error: (e as Error).message }, 502);
  }
});

const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`reia-server listening on :${info.port}`);
});

export default app;
