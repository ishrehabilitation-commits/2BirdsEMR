import clsx from "clsx";
import Link from "next/link";
import { Suspense } from "react";
import { PageHeader, Skeleton } from "@/components/ui/card";
import { DisciplineDot } from "@/components/ui/discipline";
import { getDataset } from "@/lib/data";
import { indexById, patientName, visitsOn } from "@/lib/insights";
import { addDays, formatTime, todayISO } from "@/lib/time";

export const metadata = { title: "Schedule" };

export default function SchedulePage() {
  return (
    <>
      <PageHeader title="Schedule" description="Yesterday through the next five days. Click any visit to open the patient." />
      <Suspense fallback={<Skeleton className="h-[28rem]" />}>
        <Week />
      </Suspense>
    </>
  );
}

const visitTone = {
  scheduled: "border-border bg-surface",
  in_progress: "border-accent/40 bg-accent-soft/40",
  completed: "border-border bg-surface-2/60 opacity-75",
  missed: "border-danger/40 bg-danger-soft/50",
  cancelled: "border-border bg-surface-2/60 line-through opacity-60",
};

async function Week() {
  const d = await getDataset();
  const today = todayISO();
  const patients = indexById(d.patients);
  const clinicians = indexById(d.clinicians);
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 1));

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4 xl:grid-cols-7">
      {days.map((day) => {
        const visits = visitsOn(d, day);
        const isToday = day === today;
        const label = new Date(`${day}T12:00:00Z`);
        return (
          <section
            key={day}
            className={clsx("flex flex-col rounded-2xl border bg-surface", isToday ? "border-accent ring-2 ring-accent/15" : "border-border")}
          >
            <header className="flex items-baseline justify-between border-b border-border px-3 py-2.5">
              <div>
                <div className={clsx("text-xs font-semibold uppercase tracking-wide", isToday ? "text-accent-text" : "text-muted")}>
                  {isToday ? "Today" : label.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" })}
                </div>
                <div className="text-lg font-semibold tabular-nums">{label.getUTCDate()}</div>
              </div>
              <span className="text-xs text-muted">{visits.length} visits</span>
            </header>
            <ul className="flex flex-1 flex-col gap-1.5 p-2">
              {visits.length === 0 && <li className="py-6 text-center text-xs text-muted">No visits</li>}
              {visits.map((v) => (
                <li key={v.id}>
                  <Link
                    href={`/patients/${v.patient_id}`}
                    className={clsx("block rounded-xl border px-2.5 py-2 transition hover:border-accent/50 hover:shadow-sm", visitTone[v.status])}
                  >
                    <div className="flex items-center gap-1.5 text-[11px] text-muted">
                      <DisciplineDot discipline={v.discipline} />
                      {formatTime(v.scheduled_at)} · {v.discipline}
                      {v.status === "missed" && <span className="ml-auto font-semibold text-danger">Missed</span>}
                    </div>
                    <div className="mt-0.5 truncate text-sm font-medium">{patientName(patients.get(v.patient_id))}</div>
                    <div className="truncate text-[11px] text-muted">{clinicians.get(v.clinician_id)?.full_name}</div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
