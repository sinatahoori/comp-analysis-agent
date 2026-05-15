import { afterEach, describe, expect, it } from "vitest";

import { generateCompetitorReport } from "@/lib/llm/generateCompetitorReport";

describe("generateCompetitorReport", () => {
  const originalKey = process.env.OPENAI_API_KEY;

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalKey;
  });

  it("creates report structure from mock web search results when no OpenAI key", async () => {
    delete process.env.OPENAI_API_KEY;

    const result = await generateCompetitorReport({
      competitorName: "Acme",
      webSearchResults: [
        {
          title: "Acme launches billing",
          url: "https://example.com/a",
          snippet: "Details here",
        },
      ],
    });

    expect(result.title).toContain("Acme");
    expect(result.summary.length).toBeGreaterThan(0);
    expect(result.fullReport).toContain("Acme");
    expect(result.fullReport).toContain("billing");
  });
});
