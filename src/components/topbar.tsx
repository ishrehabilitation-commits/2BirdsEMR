"use client";

import { Search } from "lucide-react";
import { openPalette } from "@/lib/client-store";

export function SearchButton() {
  return (
    <button
      onClick={openPalette}
      className="flex h-10 w-full max-w-md items-center gap-3 rounded-xl border border-border bg-surface px-3 text-sm text-muted shadow-sm transition-colors hover:border-accent/50"
    >
      <Search className="size-4" aria-hidden />
      <span className="flex-1 text-left">Search patients, reports, anything…</span>
      <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] sm:inline">⌘K</kbd>
    </button>
  );
}
