import { prisma } from "@/lib/db";
import { sendSlackReport } from "@/lib/slack/sendSlackReport";

import { analyzeCompetitor } from "./analyzeCompetitor";

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
