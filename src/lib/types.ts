// Shapes the UI works with. They mirror the tables in supabase/migrations.

export type Discipline = "PT" | "PTA" | "OT" | "COTA" | "SLP" | "RN" | "LPN" | "HHA" | "MSW";
export type PatientStatus = "referral" | "active" | "on_hold" | "discharged";
export type VisitStatus = "scheduled" | "in_progress" | "completed" | "missed" | "cancelled";
export type NoteStatus = "not_started" | "draft" | "submitted" | "approved" | "returned";
export type OrderStatus = "draft" | "sent" | "signed" | "voided";
export type AuditStatus = "open" | "in_review" | "resolved";
export type AuditSeverity = "low" | "medium" | "high";

export interface Clinician {
  id: string;
  full_name: string;
  discipline: Discipline;
}

export interface Physician {
  id: string;
  full_name: string;
  practice: string;
  phone: string;
  fax: string;
}

export interface Patient {
  id: string;
  mrn: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  status: PatientStatus;
  payer: string;
  primary_diagnosis: string;
  primary_physician_id: string;
  case_manager_id: string;
  episode_start: string;
  episode_end: string;
  city: string;
}

export interface Visit {
  id: string;
  patient_id: string;
  clinician_id: string;
  scheduled_at: string;
  discipline: Discipline;
  visit_type: string;
  status: VisitStatus;
  note_status: NoteStatus;
}

export interface PhysicianOrder {
  id: string;
  patient_id: string;
  physician_id: string;
  order_type: string;
  status: OrderStatus;
  sent_at: string | null;
  signed_at: string | null;
}

export interface FormAudit {
  id: string;
  patient_id: string;
  visit_id: string | null;
  form_type: string;
  issue: string;
  severity: AuditSeverity;
  status: AuditStatus;
  assigned_to: string | null;
  due_date: string | null;
}

export interface Dataset {
  clinicians: Clinician[];
  physicians: Physician[];
  patients: Patient[];
  visits: Visit[];
  orders: PhysicianOrder[];
  audits: FormAudit[];
}
