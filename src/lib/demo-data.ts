// Fictional demo data. Every name, phone number and diagnosis here is made up.
// The same generator feeds demo mode (no Supabase keys) and supabase/seed.sql,
// so both always show the same agency.

import type { Dataset, Discipline, NoteStatus, OrderStatus, VisitStatus } from "./types";
import { addDays, todayISO, zonedTimeToUtc } from "./time";

/** Produces date values. Demo mode returns ISO strings; the seed script returns SQL. */
export interface Clock {
  ts(dayOffset: number, hour: number, minute: number): string;
  date(dayOffset: number): string;
}

export const DEMO_AGENCY = {
  id: "a0000000-0000-4000-8000-000000000001",
  name: "Two Birds Home Health (Demo)",
};

const id = (prefix: string, n: number) => `${prefix}0000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

// Small deterministic PRNG so the data is identical every run.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CLINICIANS: [string, Discipline][] = [
  ["Maya Torres", "PT"],
  ["Ben Okafor", "PT"],
  ["Luis Romero", "PTA"],
  ["Priya Shah", "OT"],
  ["Ivy Chen", "COTA"],
  ["Hannah Lee", "SLP"],
  ["Grace Whitfield", "RN"],
  ["Marcus Bell", "RN"],
];

const PHYSICIANS: [string, string][] = [
  ["Dr. Alan Brooks", "Lakeside Family Medicine"],
  ["Dr. Rosa Delgado", "Riverbend Internal Medicine"],
  ["Dr. Samuel Kim", "Northgate Orthopedics"],
  ["Dr. Nora Patel", "Prairie Neurology Associates"],
  ["Dr. Ethan Moore", "Cedar Heart & Vascular"],
  ["Dr. Lila Haddad", "Lakeside Family Medicine"],
  ["Dr. James Whitaker", "Summit Geriatrics"],
];

const PATIENTS: [string, string, string, string][] = [
  ["Eleanor", "Vance", "1941-03-14", "s/p L total knee arthroplasty"],
  ["Harold", "Finch", "1938-11-02", "CVA with R hemiparesis"],
  ["Margaret", "Okonkwo", "1946-07-21", "CHF exacerbation"],
  ["Walter", "Briggs", "1939-01-30", "COPD, deconditioning"],
  ["Dorothy", "Castillo", "1944-05-09", "Parkinson's disease"],
  ["Frank", "Nakamura", "1950-09-17", "s/p R total hip arthroplasty"],
  ["Betty", "Lindqvist", "1936-12-25", "R hip fracture, ORIF"],
  ["George", "Abernathy", "1948-02-11", "Lumbar stenosis"],
  ["Ruth", "Delacroix", "1942-08-04", "Diabetic neuropathy, falls"],
  ["Arthur", "Pemberton", "1935-04-18", "Generalized weakness"],
  ["Irene", "Mbatha", "1947-10-29", "s/p L rotator cuff repair"],
  ["Clarence", "Holt", "1940-06-06", "CVA with aphasia"],
  ["Lorraine", "Fitzgerald", "1943-03-03", "Osteoarthritis, bilateral knees"],
  ["Stanley", "Quinones", "1937-07-13", "Pneumonia, debility"],
  ["Mildred", "Sorensen", "1945-01-22", "Multiple sclerosis"],
  ["Raymond", "Achebe", "1949-11-08", "s/p CABG"],
  ["Gladys", "Moreau", "1934-09-01", "Dementia, fall risk"],
  ["Vernon", "Iyer", "1951-05-27", "s/p L below-knee amputation"],
];

const CITIES = ["Maple Grove", "Riverton", "Cedar Falls", "Lakeview", "Brookfield"];
const PAYERS = ["Medicare Part A", "Medicare Advantage", "Medicaid", "Commercial"];

const VISIT_TYPES: Record<Discipline, string[]> = {
  PT: ["PT Evaluation", "PT Routine Visit", "PT Re-evaluation"],
  PTA: ["PTA Routine Visit"],
  OT: ["OT Evaluation", "OT Routine Visit"],
  COTA: ["COTA Routine Visit"],
  SLP: ["SLP Evaluation", "SLP Routine Visit"],
  RN: ["SOC OASIS", "Skilled Nursing Visit", "Recert OASIS"],
  LPN: ["LPN Visit"],
  HHA: ["Aide Visit"],
  MSW: ["MSW Evaluation"],
};

const ORDER_TYPES = [
  "Plan of Care (485)",
  "Verbal order: frequency change",
  "Recertification plan of care",
  "Face-to-face encounter",
  "Discharge summary",
  "DME / supply order",
];

const AUDIT_ITEMS: [string, string][] = [
  ["OASIS-E SOC", "Functional scores (GG) don't match the narrative"],
  ["OASIS-E SOC", "Homebound status justification missing"],
  ["OASIS-E Recert", "Medication profile not reconciled"],
  ["PT Evaluation", "Goals are not measurable or time-bound"],
  ["OT Evaluation", "Prior level of function not documented"],
  ["PT Routine Visit", "Visit frequency doesn't match the signed order"],
  ["SLP Evaluation", "Standardized test scores missing"],
  ["Skilled Nursing Visit", "Vital signs out of range with no MD notification"],
  ["Discharge Summary", "Goals met/not met section blank"],
  ["PT Re-evaluation", "Clinician signature missing"],
  ["OASIS-E SOC", "Pain assessment incomplete"],
  ["OT Routine Visit", "Skilled need not described"],
  ["PTA Routine Visit", "Supervisory visit overdue"],
  ["OASIS-E Recert", "Fall risk score missing"],
];

const pick = <T,>(rand: () => number, items: T[]) => items[Math.floor(rand() * items.length)];

export function generateDataset(clock: Clock): Dataset {
  const rand = mulberry32(2026);

  const clinicians = CLINICIANS.map(([full_name, discipline], i) => ({ id: id("c", i + 1), full_name, discipline }));
  const physicians = PHYSICIANS.map(([full_name, practice], i) => ({
    id: id("d", i + 1),
    full_name,
    practice,
    phone: `(555) 010-${String(1100 + i * 7).slice(-4)}`,
    fax: `(555) 010-${String(2200 + i * 7).slice(-4)}`,
  }));

  const statuses = ["active", "active", "active", "active", "active", "on_hold", "referral", "discharged"] as const;
  const patients = PATIENTS.map(([first_name, last_name, date_of_birth, primary_diagnosis], i) => {
    const startOffset = -Math.floor(rand() * 55);
    const nurses = clinicians.filter((c) => c.discipline === "RN" || c.discipline === "PT" || c.discipline === "OT");
    return {
      id: id("b", i + 1),
      mrn: `TB-${String(10421 + i * 13)}`,
      first_name,
      last_name,
      date_of_birth,
      status: i < 14 ? "active" : pick(rand, [...statuses]),
      payer: pick(rand, PAYERS),
      primary_diagnosis,
      primary_physician_id: physicians[i % physicians.length].id,
      case_manager_id: pick(rand, nurses).id,
      episode_start: clock.date(startOffset),
      episode_end: clock.date(startOffset + 59),
      city: pick(rand, CITIES),
    } as Dataset["patients"][number];
  });

  const visits: Dataset["visits"] = [];
  let visitN = 0;
  for (const patient of patients.filter((p) => p.status === "active")) {
    const team = [pick(rand, clinicians), pick(rand, clinicians)];
    for (let day = -7; day <= 7; day++) {
      for (const clinician of team) {
        if (rand() > 0.3) continue;
        const hour = 8 + Math.floor(rand() * 9);
        const minute = pick(rand, [0, 15, 30, 45]);
        let status: VisitStatus = "scheduled";
        let note_status: NoteStatus = "not_started";
        if (day < 0) {
          status = rand() < 0.92 ? "completed" : "missed";
          note_status =
            status === "missed" ? "not_started" : pick(rand, ["approved", "approved", "approved", "submitted", "draft", "returned"]);
        } else if (day === 0 && hour < 11) {
          status = "completed";
          note_status = pick(rand, ["submitted", "draft"]);
        }
        visits.push({
          id: id("e", ++visitN),
          patient_id: patient.id,
          clinician_id: clinician.id,
          scheduled_at: clock.ts(day, hour, minute),
          discipline: clinician.discipline,
          visit_type: pick(rand, VISIT_TYPES[clinician.discipline]),
          status,
          note_status,
        });
      }
    }
  }

  const orders: Dataset["orders"] = [];
  let orderN = 0;
  for (const patient of patients.filter((p) => p.status !== "referral")) {
    const count = 1 + Math.floor(rand() * 3);
    for (let k = 0; k < count; k++) {
      const roll = rand();
      const status: OrderStatus = roll < 0.4 ? "signed" : roll < 0.95 ? "sent" : "draft";
      const sentAgo = 1 + Math.floor(rand() * 45);
      orders.push({
        id: id("f", ++orderN),
        patient_id: patient.id,
        physician_id: rand() < 0.8 ? patient.primary_physician_id : pick(rand, physicians).id,
        order_type: pick(rand, ORDER_TYPES),
        status,
        sent_at: status === "draft" ? null : clock.ts(-sentAgo, 10, 0),
        signed_at: status === "signed" ? clock.ts(-Math.floor(sentAgo / 2), 15, 30) : null,
      });
    }
  }

  const activePatients = patients.filter((p) => p.status === "active");
  const audits: Dataset["audits"] = AUDIT_ITEMS.map(([form_type, issue], i) => {
    const patient = activePatients[i % activePatients.length];
    const visit = visits.find((v) => v.patient_id === patient.id && v.status === "completed");
    const roll = rand();
    return {
      id: id("9", i + 1),
      patient_id: patient.id,
      visit_id: visit?.id ?? null,
      form_type,
      issue,
      severity: pick(rand, ["low", "medium", "medium", "high"] as const),
      status: roll < 0.65 ? "open" : roll < 0.85 ? "in_review" : "resolved",
      assigned_to: visit?.clinician_id ?? pick(rand, clinicians).id,
      due_date: clock.date(-3 + Math.floor(rand() * 11)),
    };
  });

  return { clinicians, physicians, patients, visits, orders, audits };
}

/** Clock for demo mode: real dates relative to "today" in the agency time zone. */
export function runtimeClock(now = new Date()): Clock {
  const today = todayISO(now);
  return {
    ts: (dayOffset, hour, minute) => zonedTimeToUtc(addDays(today, dayOffset), hour, minute).toISOString(),
    date: (dayOffset) => addDays(today, dayOffset),
  };
}
