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

  it("puts the dashboard link before the long preview, and keeps line breaks in the preview", () => {
    process.env.APP_BASE_URL = "https://app.example.com";

    const msg = formatSlackMessage([baseReport]);

    expect(msg).toContain("*Acme*");
    expect(msg).toContain("_Competitor update: Acme_");
    expect(msg).toContain(baseReport.summary);
    expect(msg).toContain("Extra detail below");
    expect(msg).toContain("<https://app.example.com/reports/rep_1|Open full report in dashboard>");

    const linkAt = msg.indexOf("Open full report in dashboard");
    const previewAt = msg.indexOf("Extra detail below");
    expect(linkAt).toBeGreaterThan(-1);
    expect(previewAt).toBeGreaterThan(linkAt);

    // Preview must not squash the second paragraph into one line
    expect(msg).toContain("\nAdditional narrative");
  });

  it("omits link when no base URL is configured", () => {
    const msg = formatSlackMessage([baseReport]);

    expect(msg).not.toContain("Open full report");
    expect(msg).toContain(baseReport.summary);
  });

  it("turns markdown headings into Slack bold so # does not show in the preview", () => {
    const report = {
      ...baseReport,
      id: "rep_2",
      summary: "Short.",
      fullReport:
        "Short.\n\n" +
        "### Key Updates\n\n" +
        "- **One**: item\n" +
        "- [Example](https://example.com/page)\n\n" +
        "Extra padding ".repeat(100),
    };

    const msg = formatSlackMessage([report]);

    expect(msg).toContain("*Key Updates*");
    expect(msg).not.toContain("###");
    expect(msg).toMatch(/\*One\*: item/);
    expect(msg).toContain("<https://example.com/page|Example>");
  });
});
