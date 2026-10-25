"use client";

import clsx from "clsx";
import { Bird, MessageSquarePlus, Moon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { openFeedback, toggleTheme } from "@/lib/client-store";
import { NAV } from "@/lib/nav";

// The active link depends on the URL, which is only known at request time, so
// the sidebar prerenders with no highlight and the highlight streams in.
export function Sidebar() {
  return (
    <Suspense fallback={<SidebarView pathname={null} />}>
      <CurrentSidebar />
    </Suspense>
  );
}

function CurrentSidebar() {
  return <SidebarView pathname={usePathname()} />;
}

function SidebarView({ pathname }: { pathname: string | null }) {
  const isActive = (href: string) => (href === "/" ? pathname === "/" : !!pathname?.startsWith(href));

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-surface px-3 py-4 md:flex">
        <Link href="/" className="mb-6 flex items-center gap-2 px-2">
          <span className="grid size-8 place-items-center rounded-xl bg-accent text-white dark:text-slate-950">
            <Bird className="size-4.5" aria-hidden />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">2Birds</span>
        </Link>

        <nav className="flex flex-col gap-0.5" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={item.hint}
              className={clsx(
                "group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                isActive(item.href) ? "bg-accent-soft text-accent-text" : "text-muted hover:bg-surface-2 hover:text-text",
              )}
            >
              <item.icon className="size-4" aria-hidden />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-0.5">
          <button
            onClick={openFeedback}
            className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-muted hover:bg-surface-2 hover:text-text"
          >
            <MessageSquarePlus className="size-4" aria-hidden />
            Feedback
          </button>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-muted hover:bg-surface-2 hover:text-text"
          >
            <Moon className="size-4" aria-hidden />
            Theme
          </button>
        </div>
      </aside>

      {/* Mobile bottom bar */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium",
              isActive(item.href) ? "text-accent-text" : "text-muted",
            )}
          >
            <item.icon className="size-5" aria-hidden />
            {item.short}
          </Link>
        ))}
      </nav>
    </>
  );
}
