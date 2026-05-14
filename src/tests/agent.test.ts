import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    analysisRun: {
      update: vi.fn().mockResolvedValue(undefined),
    },
    competitor: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/slack/sendSlackReport", () => ({
  sendSlackReport: vi.fn().mockResolvedValue(undefined),
}));

import { runCompetitorAnalysisByRunId } from "@/lib/agent/runCompetitorAnalysis";
import { prisma } from "@/lib/db";
import { sendSlackReport } from "@/lib/slack/sendSlackReport";

describe("runCompetitorAnalysisByRunId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.competitor.findMany).mockResolvedValue([]);
  });

  it("runs pipeline with mocked external services when no competitors exist", async () => {
    await runCompetitorAnalysisByRunId("run-1");

    expect(prisma.analysisRun.update).toHaveBeenCalled();
    expect(sendSlackReport).toHaveBeenCalledWith([]);

    expect(prisma.analysisRun.update).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { id: "run-1" },
        data: expect.objectContaining({ status: "running" }),
      }),
    );

    expect(prisma.analysisRun.update).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        where: { id: "run-1" },
        data: expect.objectContaining({
          status: "completed",
          competitorsScanned: 0,
          reportsCreated: 0,
        }),
      }),
    );
  });
});
