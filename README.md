# Competitor Analysis Agent

## Overview

Proof-of-concept **Competitor Analysis Agent**: maintain a list of competitors, pull recent **public** web/news-style updates via a search API, summarize them with an LLM, persist structured reports and sources in PostgreSQL, deliver short summaries to Slack, and review everything in a lightweight Next.js UI.

## Features

- Add competitors and optional websites
- Run competitor analysis manually from the dashboard
- Fire-and-forget manual execution (`POST /api/analyze` returns immediately while work continues via `after()`)
- Daily automated scan via **Vercel Cron** (`GET /api/cron/daily-scan`)
- Generate structured reports (title, summary, full markdown narrative)
- Send aggregated summaries to Slack (Incoming Webhook)
- Browse report history and per-report source lists
- Poll analysis run status for manual runs

## Tech Stack

- **Next.js** (App Router) + **TypeScript**
- **Vercel** + **Vercel Cron**
- **PostgreSQL** + **Prisma ORM**
- **Slack Incoming Webhook**
- **Search:** Tavily when `SEARCH_API_KEY` is set (falls back to deterministic mocks locally)
- **LLM:** OpenAI (`gpt-4o-mini`) when `OPENAI_API_KEY` is set (falls back to template mock text otherwise)

## Architecture

```txt
User → Next.js UI → Next.js Route Handlers → Prisma → PostgreSQL
                         ↓
              Search API → LLM API → Slack Webhook
```

## Data Flow

1. Competitors are stored in PostgreSQL (`Competitor` rows).
2. A manual button hits `POST /api/analyze`, which inserts an `AnalysisRun` with status `queued`, schedules `runCompetitorAnalysisByRunId` using `after()`, and immediately returns `{ runId }`.
3. For each competitor the agent calls `searchMarketUpdates`, then `generateCompetitorReport`, then persists a `Report` plus related `Source` rows.
4. After all competitors finish, `sendSlackReport` posts concise summaries to Slack and marks participating reports as `sentToSlack`.
5. The UI polls `GET /api/analysis-runs/[id]` until the run completes or fails, then refreshes server-rendered lists.

## Local Setup

1. **Install**

   ```bash
   npm install
   ```

2. **Environment**

   Copy [.env.example](.env.example) to `.env` and fill values:

   - `DATABASE_URL` — PostgreSQL connection string (`sslmode=require` for managed hosts)
   - `SEARCH_API_KEY` — Tavily API key (optional for mocked search)
   - `OPENAI_API_KEY` — OpenAI key (optional for mocked LLM output)
   - `SLACK_WEBHOOK_URL` — Slack Incoming Webhook (optional; warnings only if missing)
   - `APP_BASE_URL` or `NEXT_PUBLIC_APP_URL` — optional public site URL for “open report” links in Slack (on Vercel, `VERCEL_URL` is used automatically when unset)
   - `CRON_SECRET` — shared secret checked as `Authorization: Bearer <secret>` for cron calls

3. **Database**

   ```bash
   npx prisma migrate deploy   # or `migrate dev` locally
   ```

4. **Develop**

   ```bash
   npm run dev
   ```

5. **Tests**

   ```bash
   npm test
   ```

## Deployment (Vercel)

1. Connect this repo to Vercel and provision **PostgreSQL** (Neon, Supabase, RDS, etc.).
2. Add the same environment variables from `.env.example` in the Vercel project settings.
3. Set the build command to `npm run build` (default) and ensure `postinstall` runs `prisma generate` (already scripted).
4. Apply migrations against the production database:

   ```bash
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   ```

5. Configure Slack Incoming Webhook and invite reviewers to the channel if required by the assessment brief.

> **Cron timezone:** Vercel Cron schedules use **UTC**. The sample [`vercel.json`](vercel.json) runs daily at **08:00 UTC**.

## API Routes

| Route | Method | Responsibility |
| ----- | ------ | -------------- |
| `/api/competitors` | GET | List competitors |
| `/api/competitors` | POST | Create competitor (validated body) |
| `/api/reports` | GET | List reports with competitor + sources |
| `/api/analyze` | POST | Queue manual run + fire-and-forget execution |
| `/api/analysis-runs/[id]` | GET | Poll run metadata (`queued`, `running`, `completed`, `failed`) |
| `/api/cron/daily-scan` | GET | Authenticated cron entry point |

## Agent Execution

- **Manual:** Immediate HTTP response after enqueueing work; heavy lifting executes via `after()` on the serverless runtime.
- **Cron:** Same pipeline but awaited end-to-end because no interactive caller is blocked.

## Privacy & Security

- API keys, DB credentials, Slack webhooks, and `CRON_SECRET` live only in environment variables (never committed).
- Browser clients talk only to Next.js routes—never directly to search/LLM/Slack providers.
- Only **public** competitor information (titles, URLs, snippets) is forwarded to third-party APIs.
- Cron route rejects requests without the configured bearer token.

## Testing & Monitoring

- Vitest covers competitor validation, mocked LLM/report shaping, and the agent orchestrator with mocked Prisma + Slack dependencies.
- Each execution writes an `AnalysisRun` row (timestamps, durations, counts, error strings).
- Reports record Slack delivery via `sentToSlack`.
- Runtime diagnostics rely on Vercel Function logs.

## Scalability Considerations

- Search, LLM, Slack, and persistence are isolated modules for future batching, retries, or caching.
- Slack payloads stay intentionally short; detailed narratives remain in the dashboard.
- Sequential competitor processing is acceptable for this PoC; swap `after()` for a queue/worker (Inngest, QStash, BullMQ, etc.) when workloads grow.

## Limitations (PoC scope)

- No authentication or multi-tenant isolation.
- No background queue—long runs depend on platform timeouts.
- Sequential scanning may be slow for large competitor lists.
- Search + LLM integrations gracefully degrade to mocks without API keys.

## Future Improvements

- Dedicated worker/queue with retries and dead-letter handling.
- AuthZ, auditing, and per-workspace settings.
- Rich observability (OpenTelemetry/Sentry) and structured logs.
- Smarter deduping/caching of sources and incremental Slack digests.

## Submission checklist

Before handing the assessment off (adapt reviewer emails to the real brief):

- Public GitHub repo + working Vercel deployment (no secrets committed).
- `.env.example` present; README covers architecture, fire-and-forget runs, testing/monitoring, privacy, scalability.
- Competitors can be added; manual analysis returns quickly with pollable `AnalysisRun` rows.
- Reports render in the UI and summaries reach Slack when `SLACK_WEBHOOK_URL` is configured.
- `/api/cron/daily-scan` exists and matches [`vercel.json`](vercel.json); cron auth configured via `CRON_SECRET`.
- Automated tests (`npm test`) pass locally/CI.
- Slack channel membership includes the reviewers requested by the hiring team.

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE).
