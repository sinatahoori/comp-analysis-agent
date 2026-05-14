import { prisma } from "@/lib/db";
import { DashboardRunSection } from "@/components/DashboardRunSection";
import { ReportList } from "@/components/ReportList";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [reports, latestRun, competitorCount] = await Promise.all([
    prisma.report.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { competitor: true },
    }),
    prisma.analysisRun.findFirst({
      orderBy: { startedAt: "desc" },
    }),
    prisma.competitor.count(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
          Proof of concept
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
          Competitor Analysis Agent
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          Add competitors, run an on-demand scan, or rely on the daily cron job. Each run
          searches public updates, drafts a concise report with an LLM, saves sources,
          and posts summaries to Slack.
        </p>
        <div className="flex flex-wrap gap-3 text-sm text-zinc-700 dark:text-zinc-300">
          <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
            {competitorCount} competitor{competitorCount === 1 ? "" : "s"} tracked
          </span>
          {latestRun ? (
            <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
              Last run:{" "}
              <span className="font-semibold capitalize">{latestRun.status}</span> ·{" "}
              {latestRun.triggeredBy ?? "unknown"} ·{" "}
              {new Date(latestRun.startedAt).toLocaleString()}
            </span>
          ) : (
            <span className="rounded-full bg-white px-3 py-1 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800">
              No runs yet — kick one off below.
            </span>
          )}
        </div>
      </section>

      <DashboardRunSection />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Latest reports
          </h2>
        </div>
        <ReportList reports={reports} />
      </section>
    </main>
  );
}
