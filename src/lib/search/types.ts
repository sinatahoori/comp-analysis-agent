/** Shape returned by the market search integration (before persisting as SearchResult). */
export type WebSearchResult = {
  title: string;
  url: string;
  snippet?: string;
  publishedAt?: Date | null;
  score?: number | null;
};


export type SearchInput = {
  name: string;
  website?: string | null;
};

export type TavilySearchResponse = {
  results?: Array<{
    title?: string;
    url?: string;
    content?: string;
    published_date?: string | null;
    score?: number | null;
  }>;
};