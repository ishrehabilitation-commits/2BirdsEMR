import { Suspense } from "react";
import { PageHeader, Skeleton } from "@/components/ui/card";
import { getDataset } from "@/lib/data";
import { indexById } from "@/lib/insights";
import { PatientTable, type PatientRow } from "./patient-table";

export const metadata = { title: "Patients" };

export default function PatientsPage() {
  return (
    <>
      <PageHeader title="Patients" description="Type a name, MRN, diagnosis, doctor or town. Filters update instantly." />
      <Suspense fallback={<Skeleton className="h-96" />}>
        <Patients />
      </Suspense>
    </>
  );
}

async function Patients() {
  const d = await getDataset();
  const physicians = indexById(d.physicians);
  const clinicians = indexById(d.clinicians);
  const rows: PatientRow[] = d.patients
    .map((p) => ({
      id: p.id,
      name: `${p.last_name}, ${p.first_name}`,
      mrn: p.mrn,
      status: p.status,
      diagnosis: p.primary_diagnosis,
      physician: physicians.get(p.primary_physician_id)?.full_name ?? "",
      caseManager: clinicians.get(p.case_manager_id)?.full_name ?? "",
      payer: p.payer,
      city: p.city,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return <PatientTable rows={rows} />;
}
