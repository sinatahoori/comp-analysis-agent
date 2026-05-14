import type { ReportWithCompetitor } from "@/lib/agent/types";
import { prisma } from "@/lib/db";

import { formatSlackMessage } from "./formatSlackMessage";

export async function sendSlackReport(reports: ReportWithCompetitor[]) {
  if (!process.env.SLACK_WEBHOOK_URL) {
    console.warn("SLACK_WEBHOOK_URL is not configured");
    return;
  }

  if (!reports.length) {
    return;
  }

  const message = formatSlackMessage(reports);

  const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: message,
    }),
  });

  if (!response.ok) {
    throw new Error(`Slack webhook failed: ${response.status}`);
  }

  await prisma.report.updateMany({
    where: {
      id: {
        in: reports.map((report) => report.id),
      },
    },
    data: {
      sentToSlack: true,
    },
  });
}
