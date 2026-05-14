import type { Competitor, Report } from "@prisma/client";

import { ReportCard } from "./ReportCard";

type ReportModel = Report & { competitor: Competitor | null };

type Props = {
  reports: ReportModel[];
  emptyMessage?: string;
};

export function ReportList({ reports, emptyMessage }: Props) {
  if (!reports.length) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {emptyMessage ??
          "No reports yet. Run an analysis after adding competitors."}
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  );
}
