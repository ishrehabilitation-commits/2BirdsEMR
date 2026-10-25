"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { StatusBadge } from "@/components/ui/badge";
import { Card, EmptyState } from "@/components/ui/card";
import { formatDate } from "@/lib/time";
import type { AuditStatus, FormAudit } from "@/lib/types";

export interface AuditRow extends FormAudit {
  patient: string;
  owner: string;
}

const COLUMNS: { status: AuditStatus; title: string; hint: string }[] = [
  { status: "open", title: "Needs fixing", hint: "Waiting on the clinician" },
  { status: "in_review", title: "In review", hint: "Fixed, QA is checking" },
  { status: "resolved", title: "Resolved", hint: "All good" },
];

const rank = { high: 0, medium: 1, low: 2 };

export function AuditBoard({ rows, today }: { rows: AuditRow[]; today: string }) {
  const owners = [...new Set(rows.map((r) => r.owner))].sort();
  const [owner, setOwner] = useState("Everyone");
  const shown = rows.filter((r) => owner === "Everyone" || r.owner === owner);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {["Everyone", ...owners].map((o) => (
          <button
            key={o}
            onClick={() => setOwner(o)}
            className={clsx(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              owner === o ? "bg-text text-bg" : "bg-surface-2 text-muted hover:text-text",
            )}
          >
            {o}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const items = shown
            .filter((r) => r.status === col.status)
            .sort((a, b) => rank[a.severity] - rank[b.severity] || (a.due_date ?? "").localeCompare(b.due_date ?? ""));
          return (
            <Card key={col.status} className="bg-surface-2/40">
              <header className="flex items-center justify-between px-4 py-3">
                <div>
                  <h2 className="text-sm font-semibold">{col.title}</h2>
                  <p className="text-xs text-muted">{col.hint}</p>
                </div>
                <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-semibold tabular-nums">{items.length}</span>
              </header>
              <div className="space-y-2 px-3 pb-3">
                {items.length === 0 && <EmptyState>Nothing here.</EmptyState>}
                {items.map((a) => {
                  const late = a.status !== "resolved" && a.due_date && a.due_date < today;
                  return (
                    <Link
                      key={a.id}
                      href={`/patients/${a.patient_id}`}
                      className="block rounded-xl border border-border bg-surface p-3 transition hover:border-accent/50 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <StatusBadge status={a.severity} />
                        <span className="truncate text-xs text-muted">{a.form_type}</span>
                      </div>
                      <p className="mt-2 text-sm font-medium leading-snug">{a.issue}</p>
                      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted">
                        <span className="truncate">
                          {a.patient} · {a.owner}
                        </span>
                        {a.due_date && (
                          <span className={clsx("shrink-0", late && "font-semibold text-danger")}>
                            {late ? "Late · " : "Due "}
                            {formatDate(a.due_date).replace(/, \d{4}$/, "")}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
