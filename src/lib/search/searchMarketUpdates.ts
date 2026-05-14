import { getOptionalEnv } from "@/lib/env";
import { SearchResult } from "./types";

type SearchInput = {
  name: string;
  website?: string | null;
};

type TavilySearchResponse = {
  results?: Array<{
    title?: string;
    url?: string;
    content?: string;
    published_date?: string | null;
  }>;
};

export async function searchMarketUpdates(
  input: SearchInput,
): Promise<SearchResult[]> {
  const query = `${input.name} latest news product updates funding partnerships | company website: ${input.website}`;

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
      },
    ];
  }

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "advanced",
      max_results: 8,
      include_answer: false,
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
    }));
}
