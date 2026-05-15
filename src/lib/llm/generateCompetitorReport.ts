import OpenAI from "openai";

import { getOptionalEnv } from "@/lib/env";
import { WebSearchResult } from "@/lib/search/types";

import { buildCompetitorReportPrompt } from "./prompts";

type GenerateReportInput = {
  competitorName: string;
  webSearchResults: WebSearchResult[];
};

type GeneratedReport = {
  title: string;
  summary: string;
  fullReport: string;
};

function mockReport(input: GenerateReportInput): GeneratedReport {
  const webSearchSummary = input.webSearchResults
    .map((hit) => `- ${hit.title}: ${hit.snippet || hit.url}`)
    .join("\n");

  return {
    title: `Competitor update: ${input.competitorName}`,
    summary: `Recent public updates were found for ${input.competitorName}.`,
    fullReport: `
## ${input.competitorName}

### Key Findings

${webSearchSummary}

### Potential Impact

Explain why these updates may matter for the assessment.

### Suggested Follow-Up

Mention what should be monitored next.
`.trim(),
  };
}

export async function generateCompetitorReport(
  input: GenerateReportInput,
): Promise<GeneratedReport> {
  const apiKey = getOptionalEnv("OPENAI_API_KEY");
  const baseURL = getOptionalEnv("OPENAI_BASE_URL");
  if (!apiKey) {
    return mockReport(input);
  }

  const client = new OpenAI({ apiKey  , baseURL  }  );
  const userPrompt = `${buildCompetitorReportPrompt(input.competitorName, input.webSearchResults)}

Return ONLY valid JSON with this shape (no markdown fences):
{"title":"string","summary":"string","fullReport":"string"}

Use markdown inside the fullReport string for headings and bullets where helpful.`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You produce concise competitor intelligence for product strategy teams. Reply with JSON only.",
      },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.4,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) {
    throw new Error("LLM returned empty response");
  }

  const parsed = JSON.parse(raw) as Partial<GeneratedReport>;
  if (
    typeof parsed.title !== "string" ||
    typeof parsed.summary !== "string" ||
    typeof parsed.fullReport !== "string"
  ) {
    throw new Error("LLM JSON missing required fields");
  }

  return {
    title: parsed.title,
    summary: parsed.summary,
    fullReport: parsed.fullReport,
  };
}
