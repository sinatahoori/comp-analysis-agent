import { afterEach, describe, expect, it } from "vitest";

import { formatSlackMessage } from "@/lib/slack/formatSlackMessage";

describe("formatSlackMessage", () => {
  const baseReport = {
    id: "rep_1",
    title: "Competitor update: Acme",
    summary:
      "Acme raised funding to expand its platform.",
    fullReport:
      "Acme raised funding to expand its platform.\n\n" +
      "Additional narrative with more detail ".repeat(40),
    sentToSlack: false,
    createdAt: new Date("2026-01-01"),
    competitorId: "comp_1",
    competitor: {
      id: "comp_1",
      name: "Acme",
      website: "https://acme.example",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  afterEach(() => {
    delete process.env.APP_BASE_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.VERCEL_URL;
  });

  it("includes title, full summary, truncated detail when fullReport is longer, and dashboard link", () => {
    process.env.APP_BASE_URL = "https://app.example.com";

    const msg = formatSlackMessage([baseReport]);

    expect(msg).toContain("*Acme*");
    expect(msg).toContain("_Competitor update: Acme_");
    expect(msg).toContain(baseReport.summary);
    expect(msg).toContain("More detail");
    expect(msg).toContain("<https://app.example.com/reports/rep_1|Open full report in dashboard>");
  });

  it("omits link when no base URL is configured", () => {
    const msg = formatSlackMessage([baseReport]);

    expect(msg).not.toContain("Open full report");
    expect(msg).toContain(baseReport.summary);
  });
});
