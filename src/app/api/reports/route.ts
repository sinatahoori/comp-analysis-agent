import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function GET() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      competitor: true,
      searchResults: true,
    },
  });

  return NextResponse.json({ reports });
}
