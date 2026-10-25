"use client";

import clsx from "clsx";
import { Pin } from "lucide-react";
import { usePinnedReports } from "@/lib/client-store";

export function PinButton({ slug, withLabel = false }: { slug: string; withLabel?: boolean }) {
  const { isPinned, toggle } = usePinnedReports();
  const pinned = isPinned(slug);
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        toggle(slug);
      }}
      title={pinned ? "Unpin from your dashboard" : "Pin to your dashboard"}
      aria-pressed={pinned}
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-lg p-1.5 text-xs font-medium transition-colors",
        withLabel && "border border-border px-3 py-2",
        pinned ? "text-accent-text" : "text-muted hover:bg-surface-2 hover:text-text",
      )}
    >
      <Pin className={clsx("size-4", pinned && "fill-current")} aria-hidden />
      {withLabel && (pinned ? "Pinned" : "Pin to dashboard")}
    </button>
  );
}
