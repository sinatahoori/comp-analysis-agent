"use client";

import { useEffect, useState } from "react";

type Props = {
  runId: string;
  onTerminal?: (status: string) => void;
};

export function AnalysisRunStatus({ runId, onTerminal }: Props) {
  const [status, setStatus] = useState<string>("queued");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const interval = window.setInterval(async () => {
      try {
        const response = await fetch(`/api/analysis-runs/${runId}`);
        const data = await response.json();

        if (!response.ok) {
          setError(typeof data.error === "string" ? data.error : "Status failed");
          window.clearInterval(interval);
          return;
        }

        if (cancelled) return;

        if (data.run?.status) {
          setStatus(data.run.status);
        }

        if (data.run?.status === "completed" || data.run?.status === "failed") {
          window.clearInterval(interval);
          if (data.run?.status) {
            onTerminal?.(data.run.status);
          }
        }
      } catch {
        if (!cancelled) {
          setError("Could not poll run status");
        }
        window.clearInterval(interval);
      }
    }, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [runId, onTerminal]);

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-900/60">
      <p className="font-medium text-zinc-800 dark:text-zinc-100">
        Analysis status:{" "}
        <span className="capitalize text-emerald-700 dark:text-emerald-400">{status}</span>
      </p>
      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">Run ID: {runId}</p>
      {error ? (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
