import type { Competitor } from "@prisma/client";

export type ReportWithCompetitor = {
  id: string;
  title: string;
  summary: string;
  fullReport: string;
  sentToSlack: boolean;
  createdAt: Date;
  competitorId: string | null;
  competitor: Competitor | null;
};
