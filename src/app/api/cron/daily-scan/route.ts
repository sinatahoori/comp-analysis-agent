import { NextResponse } from "next/server";

import { runCompetitorAnalysisByRunId } from "@/lib/agent/runCompetitorAnalysis";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
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
      { status: 500 },
    );
  }
}
