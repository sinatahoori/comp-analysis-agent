import { CompetitorForm } from "@/components/CompetitorForm";
import { CompetitorList } from "@/components/CompetitorList";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CompetitorsPage() {
  const competitors = await prisma.competitor.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          Competitors
        </h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Store the brands you want to monitor. The agent uses these names when querying
          public news and web updates.
        </p>
      </header>

      <CompetitorForm />
      <CompetitorList competitors={competitors} />
    </main>
  );
}
