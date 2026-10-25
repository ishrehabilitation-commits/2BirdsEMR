"use client";

import { Download } from "lucide-react";
import type { ReportTable } from "@/lib/reports";

export function ExportButton({ table, filename }: { table: ReportTable; filename: string }) {
  const download = () => {
    const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [table.columns, ...table.rows.map((r) => r.map((c) => c.value))].map((r) => r.map(escape).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `${filename}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button onClick={download} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-surface-2">
      <Download className="size-3.5" aria-hidden /> Export CSV
    </button>
  );
}
