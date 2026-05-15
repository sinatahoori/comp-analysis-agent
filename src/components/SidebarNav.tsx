"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navLinks } from "@/lib/nav-links";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-row flex-wrap gap-2 md:flex-col md:gap-1">
      {navLinks.map((l) => {
        const active =
          l.href === "/"
            ? pathname === "/"
            : pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              active
                ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/80 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800/80"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-emerald-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-emerald-400"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
