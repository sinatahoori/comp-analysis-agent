import { getOptionalEnv } from "@/lib/env";
import { WebSearchResult , SearchInput, TavilySearchResponse } from "./types";



export async function searchMarketUpdates(
  input: SearchInput,
): Promise<WebSearchResult[]> {
  const query = `What are the latest market updates for ${input.name} website:${input.website}`;

  const apiKey = getOptionalEnv("SEARCH_API_KEY");
  if (!apiKey) {
    console.log("Searching market updates for:", query, "(mock mode)");
    return [
      {
        title: `${input.name} announces new product update`,
        url: "https://example.com/news",
        snippet:
          "Sample search result. Replace with real search API data by setting SEARCH_API_KEY.",
        publishedAt: new Date(),
        score: null,
      },
    ];
  }

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "basic",
      max_results: 4,
      time_range: "day",
      topic:"finance"
    }),
  });

  if (!response.ok) {
    throw new Error(`Search API failed: ${response.status}`);
  }

  const data = (await response.json()) as TavilySearchResponse;
  const results = data.results ?? [];

  return results
    .filter((r) => r.title && r.url)
    .map((r) => ({
      title: r.title as string,
      url: r.url as string,
      snippet: r.content,
      publishedAt: r.published_date
        ? new Date(r.published_date)
        : null,
      score: r.score ?? null,
    }));
}
