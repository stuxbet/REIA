# reia-server

Self-hosted REIA backend (deploy to your VPS). A thin proxy that keeps the
**RentCast API key server-side** and normalizes responses for the app.

## Run locally

```bash
cd server
npm install
cp .env.example .env      # add your RENTCAST_API_KEY
npm run dev               # http://localhost:8787/health
```

## Deploy to the VPS (Docker)

```bash
docker build -t reia-server ./server
docker run -d --restart unless-stopped -p 8787:8787 \
  -e RENTCAST_API_KEY=xxxxx reia-server
```

Then point the app at it (see `src/data/api.ts` in the app — `EXPO_PUBLIC_API_URL`).

## Endpoints

- `GET /health` — liveness + whether the RentCast key is configured.
- `GET /enrich?address=...` — owner/tax enrichment for a property _(next)_.
- `GET /listings?...` — on-market listings for the deal feed _(later)_.

## Notes

- No secrets in the repo: the key lives in `.env` / the container env, never the app bundle.
- Tech: Node + TypeScript (run via `tsx`) + Hono. Portable to any VPS with Node or Docker.
