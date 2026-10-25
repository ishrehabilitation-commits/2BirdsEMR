import { AlertTriangle, CalendarCheck, ClipboardCheck, FileSignature, Phone } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { PinnedReports } from "@/components/pinned-reports";
import { StatusBadge, Badge } from "@/components/ui/badge";
import { Card, CardHeader, EmptyState, PageSkeleton } from "@/components/ui/card";
import { DisciplineDot } from "@/components/ui/discipline";
import { getDataset } from "@/lib/data";
import { indexById, kpis, openAudits, patientName, physicianHotlist, visitsOn, ORDER_OVERDUE_DAYS } from "@/lib/insights";
import { AGENCY_TZ, formatDate, formatTime, formatWeekday, todayISO } from "@/lib/time";

export default function TodayPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Dashboard />
    </Suspense>
  );
}

function greeting(now: Date) {
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: AGENCY_TZ, hour: "numeric", hourCycle: "h23" }).format(now));
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

async function Dashboard() {
  const d = await getDataset();
  const today = todayISO();
  const k = kpis(d, today);
  const patients = indexById(d.patients);
  const clinicians = indexById(d.clinicians);
  const todays = visitsOn(d, today);
  const hotlist = physicianHotlist(d, today).slice(0, 5);
  const audits = openAudits(d).slice(0, 5);

  const tiles = [
    { label: "Visits today", value: k.visitsToday, sub: `${k.visitsDone} done`, href: "/schedule", icon: CalendarCheck, alert: false },
    { label: "Unsigned orders", value: k.unsignedOrders, sub: `${k.overdueOrders} over ${ORDER_OVERDUE_DAYS} days`, href: "/orders", icon: FileSignature, alert: k.overdueOrders > 0 },
    { label: "Open form audits", value: k.openAudits, sub: `${k.highAudits} high priority`, href: "/audits", icon: ClipboardCheck, alert: k.highAudits > 0 },
    { label: "Notes to finish", value: k.notesOutstanding, sub: "completed visits", href: "/reports/notes-outstanding", icon: AlertTriangle, alert: k.notesOutstanding > 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted">{formatWeekday(today)}</p>
        <h1 className="text-2xl font-semibold tracking-tight">{greeting(new Date())} 👋</h1>
        <p className="mt-1 text-sm text-muted">
          {k.activePatients} active patients. Here is what needs attention, all in one place.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {tiles.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className="group rounded-2xl border border-border bg-surface p-4 transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted">{t.label}</span>
              <t.icon className={t.alert ? "size-4 text-danger" : "size-4 text-muted"} aria-hidden />
            </div>
            <div className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">{t.value}</div>
            <div className={t.alert ? "mt-1 text-xs font-medium text-danger" : "mt-1 text-xs text-muted"}>{t.sub}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="Today's visits" subtitle={`${todays.length} scheduled across the team`} href="/schedule" />
          {todays.length === 0 ? (
            <EmptyState>No visits today. Enjoy the quiet.</EmptyState>
          ) : (
            <ul className="divide-y divide-border">
              {todays.slice(0, 8).map((v) => (
                <li key={v.id}>
                  <Link href={`/patients/${v.patient_id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-surface-2/60">
                    <span className="w-16 shrink-0 text-sm tabular-nums text-muted">{formatTime(v.scheduled_at)}</span>
                    <DisciplineDot discipline={v.discipline} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{patientName(patients.get(v.patient_id))}</div>
                      <div className="truncate text-xs text-muted">
                        {v.visit_type} · {clinicians.get(v.clinician_id)?.full_name}
                      </div>
                    </div>
                    <StatusBadge status={v.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Physician hotlist" subtitle="Doctors with unsigned orders" href="/orders" />
          {hotlist.length === 0 ? (
            <EmptyState>Every order is signed. 🎉</EmptyState>
          ) : (
            <ul className="divide-y divide-border">
              {hotlist.map((h) => (
                <li key={h.physicianId} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <Link href={`/orders#${h.physicianId}`} className="truncate text-sm font-medium hover:underline">
                      {h.name}
                    </Link>
                    <div className="truncate text-xs text-muted">
                      {h.orders.length} unsigned · oldest {h.oldestDays}d
                    </div>
                  </div>
                  {h.overdue > 0 && <Badge tone="danger">{h.overdue} overdue</Badge>}
                  <a href={`tel:${h.phone}`} className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-text" title={`Call ${h.phone}`}>
                    <Phone className="size-4" aria-label={`Call ${h.name}`} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader title="Form audits needing attention" subtitle="Highest priority first" href="/audits" />
          {audits.length === 0 ? (
            <EmptyState>No open audits.</EmptyState>
          ) : (
            <ul className="divide-y divide-border">
              {audits.map((a) => (
                <li key={a.id}>
                  <Link href={`/patients/${a.patient_id}`} className="flex items-start gap-3 px-5 py-3 hover:bg-surface-2/60">
                    <StatusBadge status={a.severity} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{a.issue}</div>
                      <div className="truncate text-xs text-muted">
                        {a.form_type} · {patientName(patients.get(a.patient_id))}
                        {a.due_date && ` · due ${formatDate(a.due_date)}`}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="lg:col-span-2">
          <PinnedReports />
        </div>
      </div>
    </div>
  );
}
