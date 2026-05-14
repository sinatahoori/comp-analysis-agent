import { SearchResult } from "@/lib/search/types";

export function buildCompetitorReportPrompt(
  competitorName: string,
  sources: SearchResult[],
) {
  return `
You are an analyst preparing a concise competitor update report.

Competitor:
${competitorName}

Sources:
${sources
  .map(
    (source, index) => `
${index + 1}. ${source.title}
URL: ${source.url}
Snippet: ${source.snippet || "No snippet"}
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
