# Cursor Instructions — Competitor Analysis Agent

Use this document as the implementation guide for the assessment project.

The goal is to build the project myself, not to generate the full app automatically. Use this file to create the folder structure, sample APIs, service placeholders, and clear responsibilities for each part of the application.

---

## 1. Project Goal

Build a proof of concept for a **Competitor Analysis Agent** for the assessment.

The agent should:

1. Allow the user to add a list of competitors.
2. Scan the market for latest public updates about those competitors.
3. Create a report from the results.
4. Send the report automatically to Slack.
5. Display the results in a simple UI.

Hard requirements from the assessment:

```txt
Next.js
Vercel
```

Out of scope:

```txt
Authentication/login
```

Important implementation decisions:

```txt
Use one full-stack Next.js app.
Do not create a separate backend.
Use TypeScript.
Use PostgreSQL as the database.
Use Prisma as the ORM.
Use fire-and-forget agent execution for manual runs.
Do not implement a queue/worker system for the PoC.
```

---

## 2. What “Proof of Concept” Means Here

This project should be a small but working version of the real idea.

It does not need:

```txt
Authentication
Billing
Multi-workspace support
Advanced admin dashboard
Enterprise-level monitoring
A separate backend service
A queue/worker system
```

It should prove the main flow works:

```txt
User adds competitors
        ↓
System searches public market updates
        ↓
System generates a report
        ↓
System saves the report
        ↓
System sends a Slack summary
        ↓
System shows reports in the UI
```

The PoC should still be structured professionally, so it can grow later.

---

## 3. Tech Stack

Use:

```txt
Next.js
TypeScript
Vercel
Vercel Cron
PostgreSQL
Prisma
Slack Incoming Webhook
Search API: Tavily / SerpAPI / Brave Search / NewsAPI / Perplexity
LLM API: OpenAI / Anthropic / other
```

The backend should be implemented with:

```txt
Next.js API routes
Next.js server-side functions
Vercel Functions
Vercel Cron
```

All frontend components should use `.tsx`.

All backend, service, and utility files should use `.ts`.

---

## 4. Project Creation Command

Create the project with TypeScript:

```bash
npx create-next-app@latest competitor-analysis-agent --typescript
```

Recommended choices:

```txt
TypeScript: Yes
ESLint: Yes
Tailwind CSS: Optional, but recommended
src/ directory: Yes
App Router: Yes
Turbopack: Optional
Import alias: Yes, use @/*
```

---

## 5. High-Level Architecture

```txt
User
 ↓
Next.js UI
 ↓
Next.js API Routes / Server Actions
 ↓
PostgreSQL Database via Prisma
 ↓
Search API for public competitor updates
 ↓
LLM API for report generation
 ↓
Database stores generated report and sources
 ↓
Slack Webhook sends report
 ↓
UI displays report history
```

Short explanation:

```txt
The agent is implemented as a pipeline. Competitors are stored in PostgreSQL. A manual API endpoint and a Vercel Cron endpoint can trigger the analysis. For each competitor, the backend calls a search API to retrieve recent public web/news updates. These results are normalized and passed to an LLM to generate a concise competitor report. The report and its sources are stored in the database, displayed in the dashboard, and sent to Slack through a webhook.
```

---

## 6. Manual Run: Fire-and-Forget Approach

For the manual “Run analysis now” button, use a fire-and-forget style flow.

The user request should not wait for the full analysis to finish.

Recommended flow:

```txt
User clicks "Run analysis now"
        ↓
POST /api/analyze
        ↓
Create AnalysisRun with status = queued
        ↓
Return runId immediately
        ↓
Run the agent asynchronously after the response
        ↓
Update AnalysisRun to running/completed/failed
        ↓
UI can poll the run status and refresh reports
```

This gives a better user experience than blocking the request.

For this PoC, use Next.js `after()` for post-response execution.

Do not implement queue + worker for this assessment.

Future production note:

```txt
For larger workloads, this fire-and-forget approach can later be replaced by a queue/worker system such as Inngest, Upstash QStash, Trigger.dev, or BullMQ.
```

---

## 7. Suggested Folder Structure

Create this structure:

```txt
competitor-analysis-agent/
│
├── README.md
├── LICENSE
├── .env.example
├── vercel.json
├── package.json
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   │
│   │   ├── competitors/
│   │   │   └── page.tsx
│   │   │
│   │   ├── reports/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   │
│   │   └── api/
│   │       ├── competitors/
│   │       │   └── route.ts
│   │       │
│   │       ├── reports/
│   │       │   └── route.ts
│   │       │
│   │       ├── analyze/
│   │       │   └── route.ts
│   │       │
│   │       ├── analysis-runs/
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       │
│   │       └── cron/
│   │           └── daily-scan/
│   │               └── route.ts
│   │
│   ├── components/
│   │   ├── CompetitorForm.tsx
│   │   ├── CompetitorList.tsx
│   │   ├── ReportCard.tsx
│   │   ├── ReportList.tsx
│   │   ├── RunAnalysisButton.tsx
│   │   └── AnalysisRunStatus.tsx
│   │
│   ├── lib/
│   │   ├── db.ts
│   │   ├── env.ts
│   │   ├── validation.ts
│   │   │
│   │   ├── search/
│   │   │   ├── searchMarketUpdates.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── llm/
│   │   │   ├── generateCompetitorReport.ts
│   │   │   └── prompts.ts
│   │   │
│   │   ├── slack/
│   │   │   ├── sendSlackReport.ts
│   │   │   └── formatSlackMessage.ts
│   │   │
│   │   └── agent/
│   │       ├── runCompetitorAnalysis.ts
│   │       ├── analyzeCompetitor.ts
│   │       └── types.ts
│   │
│   └── tests/
│       ├── validation.test.ts
│       ├── report-generator.test.ts
│       └── agent.test.ts
```

---

## 8. Environment Variables

Create `.env.example`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

SEARCH_API_KEY=""
OPENAI_API_KEY=""

SLACK_WEBHOOK_URL=""

CRON_SECRET=""

NODE_ENV="development"
```

Rules:

```txt
Never commit the real .env file.
Never hardcode secrets.
Never expose API keys to the browser.
Only use secrets in server-side code.
```

---

## 9. Database

Use:

```txt
PostgreSQL
Prisma
```

PostgreSQL stores:

```txt
Competitors
Generated reports
Source URLs / search results
Slack delivery status
Analysis run history
```

Prisma is used to:

```txt
Define the database schema
Run migrations
Generate a type-safe database client
Query the database from Next.js server-side code
```

---

## 10. Prisma Schema Sample

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Competitor {
  id        String   @id @default(cuid())
  name      String
  website   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  reports   Report[]
  sources   Source[]

  @@index([createdAt])
}

model Report {
  id           String   @id @default(cuid())
  title        String
  summary      String
  fullReport   String
  sentToSlack  Boolean  @default(false)
  createdAt    DateTime @default(now())

  competitorId String?
  competitor   Competitor? @relation(fields: [competitorId], references: [id])

  sources      Source[]

  @@index([competitorId])
  @@index([createdAt])
}

model Source {
  id           String   @id @default(cuid())
  title        String
  url          String
  snippet      String?
  publishedAt  DateTime?
  createdAt    DateTime @default(now())

  competitorId String?
  competitor   Competitor? @relation(fields: [competitorId], references: [id])

  reportId     String?
  report       Report? @relation(fields: [reportId], references: [id])

  @@index([competitorId])
  @@index([reportId])
  @@index([createdAt])
}

model AnalysisRun {
  id                 String   @id @default(cuid())
  status             String
  triggeredBy         String?
  startedAt           DateTime @default(now())
  finishedAt          DateTime?
  error               String?
  competitorsScanned  Int      @default(0)
  reportsCreated      Int      @default(0)
  durationMs          Int?

  @@index([status])
  @@index([startedAt])
}
```

Notes:

```txt
AnalysisRun is a monitoring/history table for each agent execution.
It helps show when the agent ran, whether it succeeded, and what failed.
```

Possible statuses:

```txt
queued
running
completed
failed
```

Possible trigger types:

```txt
manual
cron
```

---

## 11. Database Client

Create `src/lib/db.ts`:

```ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

---

## 12. API Routes

### 12.1 Competitors API

File:

```txt
src/app/api/competitors/route.ts
```

Purpose:

```txt
GET: return saved competitors
POST: create a new competitor
```

Sample skeleton:

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateCompetitorInput } from "@/lib/validation";

export async function GET() {
  const competitors = await prisma.competitor.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ competitors });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = validateCompetitorInput(body);

    const competitor = await prisma.competitor.create({
      data: {
        name: input.name,
        website: input.website,
      },
    });

    return NextResponse.json({ competitor }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid request",
      },
      { status: 400 }
    );
  }
}
```

---

### 12.2 Reports API

File:

```txt
src/app/api/reports/route.ts
```

Purpose:

```txt
GET: return report history
```

Sample skeleton:

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      competitor: true,
      sources: true,
    },
  });

  return NextResponse.json({ reports });
}
```

---

### 12.3 Manual Analysis API — Fire-and-Forget

File:

```txt
src/app/api/analyze/route.ts
```

Purpose:

```txt
Allow the reviewer to click a button and run the agent immediately.
Return a runId immediately so the request does not wait for the full analysis.
Run the agent asynchronously after the response.
```

Sample skeleton using Next.js `after()`:

```ts
import { NextResponse } from "next/server";
import { after } from "next/server";
import { prisma } from "@/lib/db";
import { runCompetitorAnalysisByRunId } from "@/lib/agent/runCompetitorAnalysis";

export async function POST() {
  const run = await prisma.analysisRun.create({
    data: {
      status: "queued",
      triggeredBy: "manual",
    },
  });

  after(async () => {
    try {
      await runCompetitorAnalysisByRunId(run.id);
    } catch (error) {
      console.error("Fire-and-forget analysis failed", error);
    }
  });

  return NextResponse.json({
    success: true,
    runId: run.id,
    status: "queued",
  });
}
```

Important:

```txt
Do not call the search API, LLM API, or Slack directly in this route.
Keep this route thin.
The real work should happen in runCompetitorAnalysisByRunId().
```

---

### 12.4 Analysis Run Status API

File:

```txt
src/app/api/analysis-runs/[id]/route.ts
```

Purpose:

```txt
Allow the UI to poll the status of a fire-and-forget analysis run.
```

Sample skeleton:

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;

  const run = await prisma.analysisRun.findUnique({
    where: { id },
  });

  if (!run) {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }

  return NextResponse.json({ run });
}
```

---

### 12.5 Vercel Cron API

File:

```txt
src/app/api/cron/daily-scan/route.ts
```

Purpose:

```txt
Run automatically every day through Vercel Cron.
Protect the endpoint using CRON_SECRET.
```

Sample skeleton:

```ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runCompetitorAnalysisByRunId } from "@/lib/agent/runCompetitorAnalysis";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const run = await prisma.analysisRun.create({
    data: {
      status: "queued",
      triggeredBy: "cron",
    },
  });

  try {
    const result = await runCompetitorAnalysisByRunId(run.id);

    return NextResponse.json({
      success: true,
      runId: run.id,
      result,
    });
  } catch (error) {
    console.error("Cron analysis failed", error);

    return NextResponse.json(
      {
        success: false,
        runId: run.id,
        error: "Cron analysis failed",
      },
      { status: 500 }
    );
  }
}
```

Note:

```txt
The cron endpoint can wait for completion because it is not blocking a user request.
The manual endpoint should return immediately.
```

---

## 13. Vercel Cron Config

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-scan",
      "schedule": "0 8 * * *"
    }
  ]
}
```

This runs daily at 08:00 UTC.

Mention in the README that Vercel Cron uses UTC.

---

## 14. Agent Structure

The agent should be structured as a pipeline:

```txt
runCompetitorAnalysisByRunId()
  ↓
update AnalysisRun to running
  ↓
get competitors from database
  ↓
for each competitor:
    analyzeCompetitor()
      ↓
      searchMarketUpdates()
      ↓
      generateCompetitorReport()
      ↓
      save report and sources
  ↓
send combined Slack report
  ↓
update AnalysisRun to completed or failed
```

Avoid putting all logic inside one API route.

Keep API routes thin and move logic into services.

---

## 15. Main Agent Runner

Create:

```txt
src/lib/agent/runCompetitorAnalysis.ts
```

Sample skeleton:

```ts
import { prisma } from "@/lib/db";
import { analyzeCompetitor } from "./analyzeCompetitor";
import { sendSlackReport } from "@/lib/slack/sendSlackReport";

export async function runCompetitorAnalysisByRunId(runId: string) {
  const startedAt = Date.now();

  await prisma.analysisRun.update({
    where: { id: runId },
    data: {
      status: "running",
    },
  });

  try {
    const competitors = await prisma.competitor.findMany();

    const reports = [];

    for (const competitor of competitors) {
      const report = await analyzeCompetitor(competitor);
      reports.push(report);
    }

    await sendSlackReport(reports);

    await prisma.analysisRun.update({
      where: { id: runId },
      data: {
        status: "completed",
        finishedAt: new Date(),
        competitorsScanned: competitors.length,
        reportsCreated: reports.length,
        durationMs: Date.now() - startedAt,
      },
    });

    return {
      runId,
      competitorsScanned: competitors.length,
      reportsCreated: reports.length,
    };
  } catch (error) {
    await prisma.analysisRun.update({
      where: { id: runId },
      data: {
        status: "failed",
        finishedAt: new Date(),
        error: error instanceof Error ? error.message : "Unknown error",
        durationMs: Date.now() - startedAt,
      },
    });

    throw error;
  }
}
```

---

## 16. Analyze One Competitor

Create:

```txt
src/lib/agent/analyzeCompetitor.ts
```

Sample skeleton:

```ts
import { Competitor } from "@prisma/client";
import { prisma } from "@/lib/db";
import { searchMarketUpdates } from "@/lib/search/searchMarketUpdates";
import { generateCompetitorReport } from "@/lib/llm/generateCompetitorReport";

export async function analyzeCompetitor(competitor: Competitor) {
  const sources = await searchMarketUpdates({
    name: competitor.name,
    website: competitor.website,
  });

  const generated = await generateCompetitorReport({
    competitorName: competitor.name,
    sources,
  });

  const report = await prisma.report.create({
    data: {
      competitorId: competitor.id,
      title: generated.title,
      summary: generated.summary,
      fullReport: generated.fullReport,
      sources: {
        create: sources.map((source) => ({
          competitorId: competitor.id,
          title: source.title,
          url: source.url,
          snippet: source.snippet,
          publishedAt: source.publishedAt,
        })),
      },
    },
    include: {
      competitor: true,
      sources: true,
    },
  });

  return report;
}
```

---

## 17. Search Service

Create:

```txt
src/lib/search/searchMarketUpdates.ts
src/lib/search/types.ts
```

Purpose:

```txt
Search public web/news for each competitor.
Normalize the results so the rest of the app does not depend on one search provider.
```

Start with mocked data first, then replace it with a real search API.

Good options:

```txt
Tavily
SerpAPI
Brave Search API
NewsAPI
Perplexity API
```

`src/lib/search/types.ts`

```ts
export type SearchResult = {
  title: string;
  url: string;
  snippet?: string;
  publishedAt?: Date | null;
};
```

`src/lib/search/searchMarketUpdates.ts`

```ts
import { SearchResult } from "./types";

type SearchInput = {
  name: string;
  website?: string | null;
};

export async function searchMarketUpdates(input: SearchInput): Promise<SearchResult[]> {
  const query = `${input.name} latest news product updates funding partnerships`;

  // TODO:
  // Replace this mock with a real search API call.
  // Keep the returned data normalized as SearchResult[].
  // The API key must only be used server-side.

  console.log("Searching market updates for:", query);

  return [
    {
      title: `${input.name} announces new product update`,
      url: "https://example.com/news",
      snippet: "Sample search result. Replace with real search API data.",
      publishedAt: new Date(),
    },
  ];
}
```

---

## 18. LLM Report Generator

Create:

```txt
src/lib/llm/generateCompetitorReport.ts
src/lib/llm/prompts.ts
```

Purpose:

```txt
Convert search results into a useful structured report.
Keep the output concise and business-focused.
```

`src/lib/llm/generateCompetitorReport.ts`

```ts
import { SearchResult } from "@/lib/search/types";

type GenerateReportInput = {
  competitorName: string;
  sources: SearchResult[];
};

export async function generateCompetitorReport(input: GenerateReportInput) {
  // TODO:
  // Replace this mock with an LLM API call.
  // Use OpenAI, Anthropic, or another LLM provider.
  // Only send public competitor-related data to the LLM.

  const sourceSummary = input.sources
    .map((source) => `- ${source.title}: ${source.snippet || source.url}`)
    .join("\n");

  return {
    title: `Competitor update: ${input.competitorName}`,
    summary: `Recent public updates were found for ${input.competitorName}.`,
    fullReport: `
## ${input.competitorName}

### Key Findings

${sourceSummary}

### Potential Impact

Explain why these updates may matter for the assessment.

### Suggested Follow-Up

Mention what should be monitored next.
    `.trim(),
  };
}
```

`src/lib/llm/prompts.ts`

```ts
import { SearchResult } from "@/lib/search/types";

export function buildCompetitorReportPrompt(
  competitorName: string,
  sources: SearchResult[]
) {
  return `
You are an analyst preparing a concise competitor update report.

Competitor:
${competitorName}

Sources:
${sources
  .map(
    (source, index) => `
${index + 1}. ${source.title}
URL: ${source.url}
Snippet: ${source.snippet || "No snippet"}
`
  )
  .join("\n")}

Please create a structured report with:
1. Key updates
2. Why it matters
3. Potential impact
4. Suggested follow-up actions

Keep it concise and business-focused.
`;
}
```

---

## 19. Slack Service

Create:

```txt
src/lib/slack/sendSlackReport.ts
src/lib/slack/formatSlackMessage.ts
```

Purpose:

```txt
Send the generated report summary to Slack.
Use Slack Incoming Webhook.
Never expose the webhook URL to the browser.
```

`src/lib/slack/sendSlackReport.ts`

```ts
import { prisma } from "@/lib/db";
import { formatSlackMessage } from "./formatSlackMessage";

export async function sendSlackReport(reports: any[]) {
  if (!process.env.SLACK_WEBHOOK_URL) {
    console.warn("SLACK_WEBHOOK_URL is not configured");
    return;
  }

  if (!reports.length) {
    return;
  }

  const message = formatSlackMessage(reports);

  const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: message,
    }),
  });

  if (!response.ok) {
    throw new Error(`Slack webhook failed: ${response.status}`);
  }

  await prisma.report.updateMany({
    where: {
      id: {
        in: reports.map((report) => report.id),
      },
    },
    data: {
      sentToSlack: true,
    },
  });
}
```

`src/lib/slack/formatSlackMessage.ts`

```ts
export function formatSlackMessage(reports: any[]) {
  if (!reports.length) {
    return "No competitor reports were generated.";
  }

  const lines = reports.map((report) => {
    const competitorName = report.competitor?.name || "Unknown competitor";

    return `*${competitorName}*\n${report.summary}`;
  });

  return `
:chart_with_upwards_trend: *Daily Competitor Analysis Report*

${lines.join("\n\n")}

Generated by the Competitor Analysis Agent.
`.trim();
}
```

Slack recommendation:

```txt
Keep Slack messages short.
Send summaries to Slack.
Keep full reports in the dashboard.
```

---

## 20. UI Pages

### 20.1 Dashboard

Create:

```txt
src/app/page.tsx
```

Purpose:

```txt
Show a quick overview.
Show latest reports.
Show a button to manually run analysis.
Show latest analysis run status if available.
```

Sample:

```tsx
export default function HomePage() {
  return (
    <main>
      <h1>Competitor Analysis Agent</h1>

      <section>
        <h2>Overview</h2>
        <p>
          Add competitors, run an analysis, and receive automated competitor
          reports in Slack.
        </p>
      </section>

      <section>
        {/* TODO: Add RunAnalysisButton */}
      </section>

      <section>
        {/* TODO: Add AnalysisRunStatus */}
      </section>

      <section>
        {/* TODO: Show latest reports */}
      </section>
    </main>
  );
}
```

---

### 20.2 Competitors Page

Create:

```txt
src/app/competitors/page.tsx
```

Purpose:

```txt
Add competitors.
Show saved competitors.
```

Sample:

```tsx
export default function CompetitorsPage() {
  return (
    <main>
      <h1>Competitors</h1>

      {/* TODO: CompetitorForm */}
      {/* TODO: CompetitorList */}
    </main>
  );
}
```

---

### 20.3 Reports Page

Create:

```txt
src/app/reports/page.tsx
```

Purpose:

```txt
Show historical reports.
```

Sample:

```tsx
export default function ReportsPage() {
  return (
    <main>
      <h1>Reports</h1>

      {/* TODO: ReportList */}
    </main>
  );
}
```

---

## 21. Component Samples

### 21.1 Competitor Form

Create:

```txt
src/components/CompetitorForm.tsx
```

Sample:

```tsx
"use client";

import { useState } from "react";

export function CompetitorForm() {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    await fetch("/api/competitors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, website }),
    });

    setName("");
    setWebsite("");

    // TODO: refresh list
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Competitor name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />

      <input
        placeholder="Website, optional"
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
      />

      <button type="submit">Add competitor</button>
    </form>
  );
}
```

---

### 21.2 Run Analysis Button

Create:

```txt
src/components/RunAnalysisButton.tsx
```

Sample:

```tsx
"use client";

import { useState } from "react";

export function RunAnalysisButton() {
  const [loading, setLoading] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);

  async function runAnalysis() {
    setLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
      });

      const data = await response.json();

      setRunId(data.runId);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={runAnalysis} disabled={loading}>
        {loading ? "Starting analysis..." : "Run analysis now"}
      </button>

      {runId && <p>Analysis started. Run ID: {runId}</p>}
    </div>
  );
}
```

---

### 21.3 Analysis Run Status

Create:

```txt
src/components/AnalysisRunStatus.tsx
```

Purpose:

```txt
Poll /api/analysis-runs/[id] to show queued, running, completed, or failed.
```

Simple idea:

```tsx
"use client";

import { useEffect, useState } from "react";

type Props = {
  runId: string;
};

export function AnalysisRunStatus({ runId }: Props) {
  const [status, setStatus] = useState<string>("queued");

  useEffect(() => {
    const interval = window.setInterval(async () => {
      const response = await fetch(`/api/analysis-runs/${runId}`);
      const data = await response.json();

      if (data.run?.status) {
        setStatus(data.run.status);
      }

      if (data.run?.status === "completed" || data.run?.status === "failed") {
        window.clearInterval(interval);
      }
    }, 2000);

    return () => window.clearInterval(interval);
  }, [runId]);

  return <p>Analysis status: {status}</p>;
}
```

---

## 22. Validation

Create:

```txt
src/lib/validation.ts
```

Use Zod or simple validation.

Simple sample:

```ts
export function validateCompetitorInput(input: unknown) {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid input");
  }

  const data = input as {
    name?: unknown;
    website?: unknown;
  };

  if (!data.name || typeof data.name !== "string") {
    throw new Error("Competitor name is required");
  }

  if (data.website && typeof data.website !== "string") {
    throw new Error("Website must be a string");
  }

  return {
    name: data.name.trim(),
    website: typeof data.website === "string" && data.website.trim()
      ? data.website.trim()
      : null,
  };
}
```

---

## 23. Testing Suggestions

Do not create a huge test suite, but include a few meaningful tests.

Recommended tests:

```txt
validation.test.ts
- rejects empty competitor name
- accepts valid competitor data

report-generator.test.ts
- creates report structure from mock sources

agent.test.ts
- runs pipeline with mocked search, LLM, and Slack services
```

Sample:

```ts
import { validateCompetitorInput } from "@/lib/validation";

describe("validateCompetitorInput", () => {
  it("throws when name is missing", () => {
    expect(() => validateCompetitorInput({})).toThrow();
  });

  it("returns cleaned competitor input", () => {
    const result = validateCompetitorInput({
      name: " HubSpot ",
      website: " https://hubspot.com ",
    });

    expect(result.name).toBe("HubSpot");
    expect(result.website).toBe("https://hubspot.com");
  });
});
```

Testing explanation for README:

```txt
The project includes basic tests for the most important business logic: competitor input validation, report generation from mock search results, and the agent pipeline with mocked external services. Search APIs, LLM APIs, and Slack are mocked so tests do not depend on real third-party services.
```

---

## 24. Monitoring and Reliability

For this proof of concept:

```txt
Store each analysis run in the AnalysisRun table.
Use statuses: queued, running, completed, failed.
Store error messages when something fails.
Store startedAt and finishedAt.
Store durationMs.
Store competitorsScanned and reportsCreated.
Use Vercel logs for runtime errors.
Mark whether a report was sent to Slack.
Keep external API calls inside separate services, so they are easy to retry or replace.
```

Why this matters:

```txt
This answers the assessment question: "Did you think about testing & monitoring?"
```

README-ready text:

```md
## Testing & Monitoring

The project includes basic tests for the core business logic rather than only testing UI rendering. The current test scope covers competitor input validation, report generation from mock search results, and the main agent pipeline with mocked external services.

Search APIs, LLM APIs, and Slack are treated as external dependencies and are mocked in tests. This avoids flaky tests and prevents real API calls during development or CI.

Each agent execution is stored in the `AnalysisRun` table. The application records whether the run was triggered manually or by Vercel Cron, when it started, when it finished, whether it completed or failed, any error message, how many competitors were scanned, and how many reports were created.

Reports also store whether they were successfully sent to Slack. Runtime errors are logged through Vercel Function logs.

For a production version, I would add Sentry or another error monitoring tool, structured logging, retry handling for failed external API calls, and alerting when scheduled runs fail.
```

---

## 25. Privacy and Security

Important implementation points:

```txt
API keys are stored in environment variables.
No secrets are committed to GitHub.
The cron endpoint is protected with CRON_SECRET.
The app only scans public competitor information.
No private customer data is sent to search or LLM providers.
Only public source titles, URLs, and snippets are sent to the LLM.
Database access happens only server-side through Prisma.
Slack webhook URL is never exposed to the browser.
Search API keys and LLM API keys are never exposed to the browser.
Basic input validation is applied when competitors are created.
```

Why this matters:

```txt
This answers the assessment question: "How did you think about privacy & security?"
```

README-ready text:

```md
## Privacy & Security

The application is designed so that sensitive credentials and third-party integrations remain server-side.

- API keys, database credentials, the Slack webhook URL, and the cron secret are stored in environment variables.
- Real secrets are not committed to GitHub. Only `.env.example` is included.
- Database access is handled through Prisma in server-side code only.
- The browser never directly calls the Search API, LLM API, Slack webhook, or database.
- The Vercel Cron endpoint is protected using `CRON_SECRET`.
- The agent only scans publicly available competitor information.
- Only public competitor-related data, such as source titles, URLs, and snippets, is sent to the LLM provider.
- No private customer data, credentials, Slack data, or internal user data is sent to third-party LLM services.
- Basic input validation is applied when creating competitors.
- Slack messages are sent server-side and contain concise report summaries based on public sources.
```

---

## 26. Scalability Notes

For the PoC:

```txt
Running the analysis sequentially is acceptable.
Manual runs use fire-and-forget so the user request is not blocked.
Cron runs can wait for completion because they are not blocking a user action.
```

For production:

```txt
Process competitors in controlled batches.
Cache recent search results to reduce API cost.
Add retry logic for failed third-party calls.
Avoid sending huge Slack messages.
Keep Slack messages short and store full reports in the dashboard.
Add database indexes on competitorId, reportId, createdAt, and status.
Move from fire-and-forget to a queue/worker system if the workload grows.
```

README-ready text:

```md
## Scalability Considerations

The PoC is designed as a modular pipeline, where search, LLM summarization, database persistence, and Slack delivery are separated into individual services. This keeps the codebase easy to extend.

Manual analysis runs use a fire-and-forget approach: the API creates an `AnalysisRun`, returns the run ID immediately, and continues the analysis asynchronously. This keeps the UI responsive.

For the current scope, competitors are processed sequentially to keep the implementation simple and predictable. In a production environment, the analysis can be processed in controlled batches to improve throughput while respecting API rate limits.

Search results and reports are stored in PostgreSQL with timestamps, making it possible to cache recent results and reduce repeated API calls. Database indexes are added on common query fields such as `competitorId`, `reportId`, `createdAt`, and `status`.

Slack messages are kept short and summary-based, while full reports remain available in the dashboard. This prevents long or unreadable Slack messages as the number of competitors grows.

If the workload grows, the fire-and-forget execution can be replaced with a queue/worker system such as Inngest, Upstash QStash, Trigger.dev, or BullMQ. That would allow retries, batching, and more reliable long-running execution.
```

---

## 27. README Sections to Include

The `README.md` should include:

```txt
# Competitor Analysis Agent

## Overview
What the agent does.

## Features
- Add competitors
- Run competitor analysis manually
- Fire-and-forget manual analysis
- Daily automated scan with Vercel Cron
- Generate reports
- Send reports to Slack
- View report history
- View analysis run status

## Tech Stack
Next.js, TypeScript, Vercel, PostgreSQL, Prisma, Slack Webhook, Search API, LLM API.

## Architecture
Add the data flow diagram.

## Data Flow
Explain step by step.

## Local Setup
How to install, set environment variables, run migrations, and start the dev server.

## Deployment
How to deploy on Vercel.

## API Routes
List routes and responsibilities.

## Agent Execution
Explain manual fire-and-forget and cron runs.

## Privacy and Security
Mention secrets, cron protection, public data only, server-side integrations.

## Testing and Monitoring
Mention tests, AnalysisRun status, Vercel logs, Slack delivery status.

## Scalability
Mention modular pipeline, batching, indexes, short Slack summaries, future queue/worker option.

## Limitations
Mention what is simplified for the PoC.

## Future Improvements
Mention queue/worker, auth, better monitoring, advanced filtering, retries.
```

---

## 28. Suggested Implementation Order

Build in this order:

```txt
1. Create Next.js project with TypeScript.
2. Set up PostgreSQL.
3. Set up Prisma.
4. Create competitor database model.
5. Create AnalysisRun database model.
6. Build competitor form and list.
7. Create reports model.
8. Add mocked search service.
9. Add mocked LLM report generator.
10. Build manual /api/analyze endpoint with fire-and-forget.
11. Add /api/analysis-runs/[id] status endpoint.
12. Save reports to database.
13. Show reports in UI.
14. Add run status polling in UI.
15. Add Slack webhook.
16. Add Vercel Cron endpoint.
17. Add tests.
18. Improve README.
19. Deploy to Vercel.
```

---

## 29. Final Submission Checklist

Before sending the assessment:

```txt
[ ] GitHub repo is public or shared with reviewers.
[ ] Vercel deployment URL works.
[ ] No secrets are committed.
[ ] .env.example is included.
[ ] README explains architecture and data flow.
[ ] README explains fire-and-forget manual execution.
[ ] README explains testing and monitoring.
[ ] README explains privacy and security.
[ ] README explains scalability considerations.
[ ] Competitors can be added.
[ ] Manual analysis button starts a run and returns quickly.
[ ] Analysis run status can be checked.
[ ] Reports are saved and visible.
[ ] Slack report is sent.
[ ] Vercel Cron endpoint exists.
[ ] Basic tests or testing explanation is included.
[ ] Slack channel includes the required reviewer emails:
    - reviewer-1@example.com
    - reviewer-2@example.com
    - reviewer-3@example.com
```

---

## 30. License

Use MIT License unless there is a specific reason not to.

Add:

```txt
LICENSE
```

And in README:

```md
## License

This project is licensed under the MIT License.
```

---

## 31. Important Design Choice

Use one app:

```txt
One GitHub repo
One Next.js app
One Vercel deployment
One PostgreSQL database
```

Do not create a separate backend unless explicitly requested.

The backend is implemented using Next.js API routes and server-side functions, keeping the project within the required Next.js + Vercel stack.

Manual agent runs use fire-and-forget execution for the PoC. A queue/worker system is intentionally not implemented, but can be added later if the workload grows.
