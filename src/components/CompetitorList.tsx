import type { Competitor } from "@prisma/client";

type Props = {
  competitors: Competitor[];
};

export function CompetitorList({ competitors }: Props) {
  if (!competitors.length) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        No competitors yet. Add one above to start scanning public updates.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-950">
      {competitors.map((c) => (
        <li
          key={c.id}
          className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-50">{c.name}</p>
            {c.website ? (
              <a
                href={c.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-emerald-700 hover:underline dark:text-emerald-400"
              >
                {c.website}
              </a>
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No website</p>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            Added {new Date(c.createdAt).toLocaleString()}
          </p>
        </li>
      ))}
    </ul>
  );
}
