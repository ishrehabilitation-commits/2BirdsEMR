"use client";

import { FileText } from "lucide-react";
import Link from "next/link";
import { usePinnedReports } from "@/lib/client-store";
import { REPORTS } from "@/lib/reports-catalog";
import { PinButton } from "./pin-button";
import { Card, CardHeader } from "./ui/card";

/** Your pinned reports, or a few to discover if you haven't pinned any yet. */
export function PinnedReports() {
  const { pins } = usePinnedReports();
  const pinned = REPORTS.filter((r) => pins.includes(r.slug));
  const showing = pinned.length ? pinned : REPORTS.slice(2, 6);

  return (
    <Card className="h-full">
      <CardHeader
        title={pinned.length ? "Your pinned reports" : "Reports you might not know about"}
        subtitle={pinned.length ? "Pin or unpin from any report" : "Pin the ones you use. They'll live here."}
        href="/reports"
      />
      <ul className="divide-y divide-border">
        {showing.map((r) => (
          <li key={r.slug}>
            <Link href={`/reports/${r.slug}`} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-2/60">
              <FileText className="size-4 shrink-0 text-muted" aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{r.title}</div>
                <div className="truncate text-xs text-muted">{r.description}</div>
              </div>
              <PinButton slug={r.slug} />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
