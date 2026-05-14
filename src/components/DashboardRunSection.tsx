"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { AnalysisRunStatus } from "./AnalysisRunStatus";
import { RunAnalysisButton } from "./RunAnalysisButton";

export function DashboardRunSection() {
  const router = useRouter();
  const [runId, setRunId] = useState<string | null>(null);

  const handleTerminal = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Manual run
        </h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Starts a fire-and-forget pipeline: search → LLM report → database → Slack summary.
        </p>
      </div>
      <RunAnalysisButton onRunStarted={(id) => setRunId(id)} />
      {runId ? (
        <AnalysisRunStatus runId={runId} onTerminal={handleTerminal} />
      ) : null}
    </div>
  );
}
