import { Mail, Phone, Printer } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, EmptyState, PageHeader, Skeleton } from "@/components/ui/card";
import { getDataset } from "@/lib/data";
import { indexById, patientName, physicianHotlist, ORDER_OVERDUE_DAYS } from "@/lib/insights";
import { formatDate, todayISO } from "@/lib/time";

export const metadata = { title: "Orders & hotlist" };

export default function OrdersPage() {
  return (
    <>
      <PageHeader
        title="Orders & physician hotlist"
        description={`Every unsigned order, grouped by doctor so one call clears several. Red means older than ${ORDER_OVERDUE_DAYS} days.`}
        actions={
          <Link href="/reports/unsigned-orders" className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted hover:text-text">
            Open as report
          </Link>
        }
      />
      <Suspense fallback={<Skeleton className="h-96" />}>
        <Hotlist />
      </Suspense>
    </>
  );
}

function agingTone(days: number) {
  return days > ORDER_OVERDUE_DAYS ? "danger" : days > 14 ? "warning" : "neutral";
}

async function Hotlist() {
  const d = await getDataset();
  const today = todayISO();
  const patients = indexById(d.patients);
  const list = physicianHotlist(d, today);

  if (list.length === 0) return <Card><EmptyState>Every order is signed. 🎉</EmptyState></Card>;

  const total = list.reduce((n, h) => n + h.orders.length, 0);
  const overdue = list.reduce((n, h) => n + h.overdue, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 text-sm">
        <Badge tone="warning">{total} unsigned</Badge>
        <Badge tone="danger">{overdue} overdue</Badge>
        <Badge>{list.length} physicians</Badge>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {list.map((h) => (
          <Card key={h.physicianId} id={h.physicianId} className="scroll-mt-24 target:ring-2 target:ring-accent">
            <div className="flex flex-wrap items-start gap-3 border-b border-border px-5 py-4">
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">{h.name}</h2>
                <p className="text-xs text-muted">{h.practice}</p>
              </div>
              <div className="flex gap-1.5">
                <a href={`tel:${h.phone}`} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-surface-2">
                  <Phone className="size-3.5" aria-hidden /> {h.phone}
                </a>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs text-muted" title="Fax">
                  <Printer className="size-3.5" aria-hidden /> {h.fax}
                </span>
              </div>
            </div>
            <ul className="divide-y divide-border">
              {h.orders.map((o) => (
                <li key={o.id} className="flex items-center gap-3 px-5 py-2.5 text-sm">
                  <div className="min-w-0 flex-1">
                    <Link href={`/patients/${o.patient_id}`} className="font-medium hover:underline">
                      {patientName(patients.get(o.patient_id))}
                    </Link>
                    <div className="truncate text-xs text-muted">
                      {o.order_type} · sent {formatDate(o.sent_at!)}
                    </div>
                  </div>
                  <Badge tone={agingTone(o.daysOut)}>{o.daysOut}d</Badge>
                </li>
              ))}
            </ul>
            <div className="flex justify-end border-t border-border px-5 py-2.5">
              <button disabled title="Coming soon" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
                <Mail className="size-3.5" aria-hidden /> Send reminder packet
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
