import Link from "next/link";

import type { Competitor, Report } from "@prisma/client";

export type ReportCardModel = Report & { competitor: Competitor | null };

type Props = {
  report: ReportCardModel;
};

export function ReportCard({ report }: Props) {
  const name = report.competitor?.name ?? "Unknown competitor";

  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-emerald-400/60 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-500/40">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            <Link href={`/reports/${report.id}`} className="hover:underline">
              {report.title}
            </Link>
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{name}</p>
        </div>
        <div className="flex flex-col items-end gap-1 text-xs text-zinc-500 dark:text-zinc-500">
          <span>{new Date(report.createdAt).toLocaleString()}</span>
          {report.sentToSlack ? (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-medium text-emerald-700 dark:text-emerald-300">
              Sent to Slack
            </span>
          ) : (
            <span className="rounded-full bg-zinc-500/10 px-2 py-0.5 font-medium text-zinc-600 dark:text-zinc-400">
              Slack pending / skipped
            </span>
          )}
        </div>
      </div>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        {report.summary}
      </p>
    </article>
  );
}
