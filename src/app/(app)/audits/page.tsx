import { Suspense } from "react";
import { PageHeader, Skeleton } from "@/components/ui/card";
import { getDataset } from "@/lib/data";
import { indexById, patientName } from "@/lib/insights";
import { todayISO } from "@/lib/time";
import { AuditBoard, type AuditRow } from "./audit-board";

export const metadata = { title: "Form audits" };

export default function AuditsPage() {
  return (
    <>
      <PageHeader
        title="Form audits"
        description="Documentation that needs a correction, sorted by what matters most. No more digging through menus to find them."
      />
      <Suspense fallback={<Skeleton className="h-96" />}>
        <Audits />
      </Suspense>
    </>
  );
}

async function Audits() {
  const d = await getDataset();
  const patients = indexById(d.patients);
  const clinicians = indexById(d.clinicians);
  const rows: AuditRow[] = d.audits.map((a) => ({
    ...a,
    patient: patientName(patients.get(a.patient_id)),
    owner: a.assigned_to ? clinicians.get(a.assigned_to)?.full_name ?? "Unassigned" : "Unassigned",
  }));
  return <AuditBoard rows={rows} today={todayISO()} />;
}
