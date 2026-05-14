import { after, NextResponse } from "next/server";

import { runCompetitorAnalysisByRunId } from "@/lib/agent/runCompetitorAnalysis";
import { prisma } from "@/lib/db";

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
