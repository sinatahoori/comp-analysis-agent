import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ id: string }>;
};

export default async function ReportDetailPage({ params }: Params) {
  const { id } = await params;

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      competitor: true,
      searchResults: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!report) {
    notFound();
  }

  const competitorName = report.competitor?.name ?? "Unknown competitor";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/reports"
          className="text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
        >
          ← All reports
        </Link>
        <span className="text-xs text-zinc-500 dark:text-zinc-500">
          {new Date(report.createdAt).toLocaleString()}
        </span>
      </div>

      <article className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
        <header className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
            {competitorName}
          </p>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {report.title}
          </h1>
          <p className="text-lg text-zinc-700 dark:text-zinc-300">{report.summary}</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {report.sentToSlack ? (
              <span className="rounded-full bg-emerald-500/15 px-2 py-1 font-semibold text-emerald-800 dark:text-emerald-200">
                Sent to Slack
              </span>
            ) : (
              <span className="rounded-full bg-zinc-500/10 px-2 py-1 font-semibold text-zinc-700 dark:text-zinc-300">
                Slack not sent (webhook missing or empty run)
              </span>
            )}
          </div>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Full report
          </h2>
          <div className="whitespace-pre-wrap rounded-xl bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-800 ring-1 ring-zinc-200 dark:bg-zinc-900/60 dark:text-zinc-100 dark:ring-zinc-800">
            {report.fullReport}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Search results
          </h2>
          {report.searchResults.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">No search results saved.</p>
          ) : (
            <ul className="space-y-3">
              {report.searchResults.map((searchResult) => (
                <li
                  key={searchResult.id}
                  className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <a
                    href={searchResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-emerald-700 hover:underline dark:text-emerald-400"
                  >
                    {searchResult.title}
                  </a>
                  {searchResult.snippet ? (
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {searchResult.snippet}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-zinc-500">
                    {searchResult.publishedAt
                      ? `Published ${new Date(searchResult.publishedAt).toLocaleDateString()}`
                      : "Publication date unknown"}
                    {typeof searchResult.score === "number"
                      ? ` · Score ${searchResult.score.toFixed(2)}`
                      : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </article>
    </main>
  );
}
