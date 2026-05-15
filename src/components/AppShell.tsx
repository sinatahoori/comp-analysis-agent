import Link from "next/link";

import packageJson from "../../package.json";
import { SidebarNav } from "./SidebarNav";

const APP_NAME = "Competitor Analysis Agent";

export function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <aside className="shrink-0 border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 md:w-56 md:border-r md:border-b-0 md:py-6">
        <div className="px-4 py-3 md:px-4 md:py-0">
          <SidebarNav />
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col md:h-dvh">
        <header className="shrink-0 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
          <div className="flex h-14 items-center px-6">
            <Link
              href="/"
              className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              {APP_NAME}
            </Link>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-auto">{children}</main>

        <footer className="shrink-0 border-t border-zinc-200 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/90">
          <div className="flex h-9 items-center justify-end px-6 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
            v{packageJson.version}
          </div>
        </footer>
      </div>
    </div>
  );
}
