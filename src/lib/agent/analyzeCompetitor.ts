import type { Competitor } from "@prisma/client";

import { prisma } from "@/lib/db";
import { generateCompetitorReport } from "@/lib/llm/generateCompetitorReport";
import { searchMarketUpdates } from "@/lib/search/searchMarketUpdates";

export async function analyzeCompetitor(competitor: Competitor) {
  const sources = await searchMarketUpdates({
    name: competitor.name,
    website: competitor.website,
  });

  const generated = await generateCompetitorReport({
    competitorName: competitor.name,
    sources,
  });

  const report = await prisma.report.create({
    data: {
      competitorId: competitor.id,
      title: generated.title,
      summary: generated.summary,
      fullReport: generated.fullReport,
      sources: {
        create: sources.map((source) => ({
          competitorId: competitor.id,
          title: source.title,
          url: source.url,
          snippet: source.snippet,
          publishedAt: source.publishedAt ?? undefined,
        })),
      },
    },
    include: {
      competitor: true,
      sources: true,
    },
  });

  return report;
}
