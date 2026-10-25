import { ArrowLeft, Phone, Printer } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card, CardHeader, EmptyState, PageSkeleton } from "@/components/ui/card";
import { DisciplineTag } from "@/components/ui/discipline";
import { getDataset } from "@/lib/data";
import { indexById, ORDER_OVERDUE_DAYS } from "@/lib/insights";
import { dateOf, daysBetween, formatDate, formatTime, todayISO } from "@/lib/time";

export default function PatientPage({ params }: PageProps<"/patients/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PatientChart params={params} />
    </Suspense>
  );
}

function age(dob: string, today: string) {
  const [y, m, d] = dob.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  return ty - y - (tm < m || (tm === m && td < d) ? 1 : 0);
}

async function PatientChart({ params }: { params: PageProps<"/patients/[id]">["params"] }) {
  const { id } = await params;
  const d = await getDataset();
  const patient = d.patients.find((p) => p.id === id);
  if (!patient) notFound();

  const today = todayISO();
  const physicians = indexById(d.physicians);
  const clinicians = indexById(d.clinicians);
  const physician = physicians.get(patient.primary_physician_id);
  const visits = d.visits.filter((v) => v.patient_id === id).sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
  const upcoming = visits.filter((v) => dateOf(v.scheduled_at) >= today && v.status === "scheduled");
  const recent = visits.filter((v) => !upcoming.includes(v)).reverse();
  const orders = d.orders.filter((o) => o.patient_id === id);
  const audits = d.audits.filter((a) => a.patient_id === id && a.status !== "resolved");

  const episodeDay = Math.min(60, Math.max(0, daysBetween(patient.episode_start, today) + 1));
  const daysLeft = daysBetween(today, patient.episode_end);

  return (
    <div className="space-y-6">
      <Link href="/patients" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text">
        <ArrowLeft className="size-4" aria-hidden /> All patients
      </Link>

      <Card className="p-5">
        <div className="flex flex-wrap items-start gap-4">
          <div className="grid size-14 place-items-center rounded-2xl bg-accent-soft text-lg font-semibold text-accent-text">
            {patient.first_name[0]}
            {patient.last_name[0]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">
                {patient.first_name} {patient.last_name}
              </h1>
              <StatusBadge status={patient.status} />
              {audits.length > 0 && <Badge tone="danger">{audits.length} open audit{audits.length > 1 ? "s" : ""}</Badge>}
            </div>
            <p className="mt-1 text-sm text-muted">
              {patient.mrn} · {age(patient.date_of_birth, today)} yrs · DOB {formatDate(patient.date_of_birth)} · {patient.city}
            </p>
            <p className="mt-2 text-sm">
              <span className="text-muted">Primary diagnosis:</span> {patient.primary_diagnosis}
            </p>
          </div>
          <button
            disabled
            title="Coming soon"
            className="hidden items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted sm:inline-flex"
          >
            <Printer className="size-4" aria-hidden /> Print summary
          </button>
        </div>

        <dl className="mt-5 grid gap-4 border-t border-border pt-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs text-muted">Physician</dt>
            <dd className="mt-0.5 font-medium">{physician?.full_name}</dd>
            {physician && (
              <a href={`tel:${physician.phone}`} className="mt-0.5 inline-flex items-center gap-1 text-xs text-accent-text hover:underline">
                <Phone className="size-3" aria-hidden /> {physician.phone}
              </a>
            )}
          </div>
          <div>
            <dt className="text-xs text-muted">Case manager</dt>
            <dd className="mt-0.5 font-medium">{clinicians.get(patient.case_manager_id)?.full_name}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Payer</dt>
            <dd className="mt-0.5 font-medium">{patient.payer}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">
              Episode {formatDate(patient.episode_start)} to {formatDate(patient.episode_end)}
            </dt>
            <dd className="mt-1.5">
              <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                <div
                  className={daysLeft <= 7 ? "h-full rounded-full bg-warning" : "h-full rounded-full bg-accent"}
                  style={{ width: `${(episodeDay / 60) * 100}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-muted">
                Day {episodeDay} of 60{daysLeft >= 0 && ` · ${daysLeft} days left`}
              </div>
            </dd>
          </div>
        </dl>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Upcoming visits" subtitle={`${upcoming.length} scheduled`} />
          {upcoming.length === 0 ? (
            <EmptyState>Nothing scheduled.</EmptyState>
          ) : (
            <ul className="divide-y divide-border">
              {upcoming.map((v) => (
                <li key={v.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                  <span className="w-28 shrink-0 text-muted">
                    {formatDate(v.scheduled_at).replace(/, \d{4}$/, "")} · {formatTime(v.scheduled_at)}
                  </span>
                  <DisciplineTag discipline={v.discipline} />
                  <span className="min-w-0 flex-1 truncate">{v.visit_type}</span>
                  <span className="hidden truncate text-xs text-muted sm:inline">{clinicians.get(v.clinician_id)?.full_name}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Open form audits" subtitle="Fix these to keep the chart clean" />
          {audits.length === 0 ? (
            <EmptyState>No open audits for this patient. ✨</EmptyState>
          ) : (
            <ul className="divide-y divide-border">
              {audits.map((a) => (
                <li key={a.id} className="flex items-start gap-3 px-5 py-3">
                  <StatusBadge status={a.severity} />
                  <div className="min-w-0 flex-1 text-sm">
                    <div className="font-medium">{a.issue}</div>
                    <div className="text-xs text-muted">
                      {a.form_type}
                      {a.due_date && ` · due ${formatDate(a.due_date)}`}
                    </div>
                  </div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Recent visits" subtitle="Most recent first" />
          {recent.length === 0 ? (
            <EmptyState>No visit history yet.</EmptyState>
          ) : (
            <ul className="divide-y divide-border">
              {recent.slice(0, 8).map((v) => (
                <li key={v.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                  <span className="w-20 shrink-0 text-muted">{formatDate(v.scheduled_at).replace(/, \d{4}$/, "")}</span>
                  <DisciplineTag discipline={v.discipline} />
                  <span className="min-w-0 flex-1 truncate">{v.visit_type}</span>
                  <StatusBadge status={v.status === "completed" ? v.note_status : v.status} prefix={v.status === "completed" ? "Note: " : ""} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Physician orders" subtitle={`${orders.length} on file`} />
          {orders.length === 0 ? (
            <EmptyState>No orders yet.</EmptyState>
          ) : (
            <ul className="divide-y divide-border">
              {orders.map((o) => {
                const out = o.status === "sent" && o.sent_at ? daysBetween(dateOf(o.sent_at), today) : null;
                return (
                  <li key={o.id} className="flex items-center gap-3 px-5 py-3 text-sm">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{o.order_type}</div>
                      <div className="truncate text-xs text-muted">
                        {physicians.get(o.physician_id)?.full_name}
                        {o.sent_at && ` · sent ${formatDate(o.sent_at)}`}
                      </div>
                    </div>
                    {out !== null && out > ORDER_OVERDUE_DAYS ? <Badge tone="danger">{out}d unsigned</Badge> : <StatusBadge status={o.status} />}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
