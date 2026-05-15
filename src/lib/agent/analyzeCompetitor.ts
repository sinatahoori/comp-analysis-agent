import type { Competitor } from "@prisma/client";

import { prisma } from "@/lib/db";
import { generateCompetitorReport } from "@/lib/llm/generateCompetitorReport";
import { searchMarketUpdates } from "@/lib/search/searchMarketUpdates";

export async function analyzeCompetitor(competitor: Competitor) {
  const webSearchResults = await searchMarketUpdates({
    name: competitor.name,
    website: competitor.website,
  });

  const generated = await generateCompetitorReport({
    competitorName: competitor.name,
    webSearchResults,
  });

  const report = await prisma.report.create({
    data: {
      competitorId: competitor.id,
      title: generated.title,
      summary: generated.summary,
      fullReport: generated.fullReport,
      searchResults: {
        create: webSearchResults.map((hit) => ({
          competitorId: competitor.id,
          title: hit.title,
          url: hit.url,
          snippet: hit.snippet,
          publishedAt: hit.publishedAt ?? undefined,
          score: hit.score ?? undefined,
        })),
      },
    },
    include: {
      competitor: true,
      searchResults: true,
    },
  });

  return report;
}
