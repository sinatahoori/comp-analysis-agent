import Link from "next/link";

import { ReportList } from "@/components/ReportList";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: { competitor: true },
  });

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Reports
          </h1>
          <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
            Full narratives stay here; Slack receives short summaries only.
          </p>
        </div>
        <Link
          href="/"
          className="text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
        >
          ← Back to dashboard
        </Link>
      </header>

      <ReportList reports={reports} />
    </main>
  );
}
