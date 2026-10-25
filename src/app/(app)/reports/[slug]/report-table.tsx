"use client";

import clsx from "clsx";
import { ArrowDown, ArrowUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyState } from "@/components/ui/card";
import type { ReportCell, ReportTable } from "@/lib/reports";

const tones: Record<NonNullable<ReportCell["tone"]>, string> = {
  danger: "font-semibold text-danger",
  warning: "font-medium text-warning",
  success: "text-success",
  muted: "text-muted",
};

/** Click any column header to sort. */
export function ReportTableView({ table }: { table: ReportTable }) {
  const [sort, setSort] = useState<{ col: number; dir: 1 | -1 } | null>(null);

  if (table.rows.length === 0) return <EmptyState>Nothing to report. That&apos;s a good thing.</EmptyState>;

  const rows = sort
    ? [...table.rows].sort((a, b) => {
        const x = a[sort.col].value;
        const y = b[sort.col].value;
        return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y))) * sort.dir;
      })
    : table.rows;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted">
            {table.columns.map((c, i) => (
              <th key={c} className="px-5 py-2.5 font-medium">
                <button
                  onClick={() => setSort(sort?.col === i ? { col: i, dir: sort.dir === 1 ? -1 : 1 } : { col: i, dir: 1 })}
                  className="inline-flex items-center gap-1 hover:text-text"
                >
                  {c}
                  {sort?.col === i && (sort.dir === 1 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, r) => (
            <tr key={r} className="hover:bg-surface-2/60">
              {row.map((cell, c) => (
                <td key={c} className={clsx("px-5 py-2.5", cell.tone && tones[cell.tone], typeof cell.value === "number" && "tabular-nums")}>
                  {cell.href ? (
                    <Link href={cell.href} className="font-medium text-text hover:text-accent-text hover:underline">
                      {cell.value}
                    </Link>
                  ) : (
                    cell.value
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
