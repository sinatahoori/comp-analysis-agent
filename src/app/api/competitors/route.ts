import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { validateCompetitorInput } from "@/lib/validation";

export async function GET() {
  const competitors = await prisma.competitor.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ competitors });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = validateCompetitorInput(body);

    const competitor = await prisma.competitor.create({
      data: {
        name: input.name,
        website: input.website,
      },
    });

    return NextResponse.json({ competitor }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Invalid request",
      },
      { status: 400 },
    );
  }
}
