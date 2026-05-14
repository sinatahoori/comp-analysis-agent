import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";

export async function GET() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      competitor: true,
      sources: true,
    },
  });

  return NextResponse.json({ reports });
}
