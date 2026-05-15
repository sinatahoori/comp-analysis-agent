import { WebSearchResult } from "@/lib/search/types";

export function buildCompetitorReportPrompt(
  competitorName: string,
  webSearchResults: WebSearchResult[],
) {
  return `
You are an analyst preparing a concise competitor update report.

Competitor:
${competitorName}

SearchResults:
${webSearchResults
  .map(
    (hit, index) => `
${index + 1}. ${hit.title}
URL: ${hit.url}
Snippet: ${hit.snippet || "No snippet"}
`,
  )
  .join("\n")}

Please create a structured report with:
1. Key updates
2. Why it matters
3. Potential impact
4. Suggested follow-up actions

Keep it concise and business-focused.
`.trim();
}
