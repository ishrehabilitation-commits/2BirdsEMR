"use client";

import clsx from "clsx";
import { Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusBadge } from "@/components/ui/badge";
import { Card, EmptyState } from "@/components/ui/card";
import type { PatientStatus } from "@/lib/types";

export interface PatientRow {
  id: string;
  name: string;
  mrn: string;
  status: PatientStatus;
  diagnosis: string;
  physician: string;
  caseManager: string;
  payer: string;
  city: string;
}

const FILTERS: { value: PatientStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "referral", label: "Referrals" },
  { value: "on_hold", label: "On hold" },
  { value: "discharged", label: "Discharged" },
];

export function PatientTable({ rows }: { rows: PatientRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<PatientStatus | "all">("all");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (status === "all" || r.status === status) &&
        (!q || Object.values(r).join(" ").toLowerCase().includes(q)),
    );
  }, [rows, query, status]);

  const count = (s: PatientStatus | "all") => (s === "all" ? rows.length : rows.filter((r) => r.status === s).length);

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
        <label className="flex h-10 min-w-56 flex-1 items-center gap-2 rounded-xl border border-border bg-bg px-3 focus-within:border-accent">
          <Search className="size-4 text-muted" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients"
            aria-label="Search patients"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={clsx(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                status === f.value ? "bg-text text-bg" : "bg-surface-2 text-muted hover:text-text",
              )}
            >
              {f.label} <span className="opacity-60">{count(f.value)}</span>
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <EmptyState>No patients match “{query}”.</EmptyState>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted">
              <tr className="border-b border-border">
                <th className="px-5 py-2.5 font-medium">Patient</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="hidden px-3 py-2.5 font-medium md:table-cell">Diagnosis</th>
                <th className="hidden px-3 py-2.5 font-medium lg:table-cell">Physician</th>
                <th className="hidden px-3 py-2.5 font-medium lg:table-cell">Case manager</th>
                <th className="hidden px-3 py-2.5 font-medium xl:table-cell">Payer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {shown.map((r) => (
                <tr key={r.id} className="group hover:bg-surface-2/60">
                  <td className="px-5 py-3">
                    <Link href={`/patients/${r.id}`} className="font-medium group-hover:text-accent-text">
                      {r.name}
                    </Link>
                    <div className="text-xs text-muted">
                      {r.mrn} · {r.city}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="hidden px-3 py-3 text-muted md:table-cell">{r.diagnosis}</td>
                  <td className="hidden px-3 py-3 text-muted lg:table-cell">{r.physician}</td>
                  <td className="hidden px-3 py-3 text-muted lg:table-cell">{r.caseManager}</td>
                  <td className="hidden px-3 py-3 text-muted xl:table-cell">{r.payer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
