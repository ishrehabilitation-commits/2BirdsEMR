"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PinButton } from "@/components/pin-button";
import { REPORTS, type ReportCategory } from "@/lib/reports-catalog";

const ORDER: ReportCategory[] = ["Orders", "Documentation", "Quality", "Scheduling", "Census"];

export function ReportCatalog() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const matches = REPORTS.filter((r) => !q || [r.title, r.description, r.category, ...r.keywords].join(" ").toLowerCase().includes(q));

  return (
    <div className="space-y-8">
      <label className="flex h-11 max-w-lg items-center gap-2 rounded-xl border border-border bg-surface px-3 focus-within:border-accent">
        <Search className="size-4 text-muted" aria-hidden />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try “485”, “late notes”, or “medicare”"
          aria-label="Search reports"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </label>

      {matches.length === 0 && <p className="text-sm text-muted">No report matches “{query}”. Tell us what you were looking for with the Feedback button.</p>}

      {ORDER.map((category) => {
        const items = matches.filter((r) => r.category === category);
        if (!items.length) return null;
        return (
          <section key={category}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">{category}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((r) => (
                <Link
                  key={r.slug}
                  href={`/reports/${r.slug}`}
                  className="group flex flex-col rounded-2xl border border-border bg-surface p-4 transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-medium group-hover:text-accent-text">{r.title}</h3>
                    <PinButton slug={r.slug} />
                  </div>
                  <p className="mt-1 text-sm text-muted">{r.description}</p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
