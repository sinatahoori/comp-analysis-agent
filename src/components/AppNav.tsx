import Link from "next/link";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/competitors", label: "Competitors" },
  { href: "/reports", label: "Reports" },
];

export function AppNav() {
  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Competitor Analysis Agent
        </Link>
        <nav className="flex flex-wrap gap-4 text-sm font-medium">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-zinc-600 transition hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-400"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
