import type { Dataset } from "./types";
import {
  episodesEndingSoon,
  indexById,
  notesOutstanding,
  openAudits,
  patientName,
  physicianHotlist,
  unsignedOrders,
  ORDER_OVERDUE_DAYS,
} from "./insights";
import { addDays, dateOf, daysBetween, formatDate } from "./time";

export interface ReportCell {
  value: string | number;
  href?: string;
  tone?: "danger" | "warning" | "success" | "muted";
}

export interface ReportTable {
  columns: string[];
  rows: ReportCell[][];
  summary: string;
}

const statusLabel = (s: string) => s.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

export function runReport(slug: string, d: Dataset, today: string): ReportTable | null {
  const patients = indexById(d.patients);
  const physicians = indexById(d.physicians);
  const clinicians = indexById(d.clinicians);
  const patientCell = (id: string): ReportCell => ({ value: patientName(patients.get(id)), href: `/patients/${id}` });

  switch (slug) {
    case "unsigned-orders": {
      const orders = unsignedOrders(d, today);
      return {
        summary: `${orders.length} unsigned orders, ${orders.filter((o) => o.daysOut > ORDER_OVERDUE_DAYS).length} older than ${ORDER_OVERDUE_DAYS} days.`,
        columns: ["Patient", "Order", "Physician", "Sent", "Days out"],
        rows: orders.map((o) => [
          patientCell(o.patient_id),
          { value: o.order_type },
          { value: physicians.get(o.physician_id)?.full_name ?? "" },
          { value: formatDate(o.sent_at!) },
          { value: o.daysOut, tone: o.daysOut > ORDER_OVERDUE_DAYS ? "danger" : o.daysOut > 14 ? "warning" : undefined },
        ]),
      };
    }
    case "physician-hotlist": {
      const list = physicianHotlist(d, today);
      return {
        summary: `${list.length} physicians have unsigned orders.`,
        columns: ["Physician", "Practice", "Phone", "Fax", "Unsigned", "Overdue", "Oldest (days)"],
        rows: list.map((h) => [
          { value: h.name, href: `/orders#${h.physicianId}` },
          { value: h.practice },
          { value: h.phone },
          { value: h.fax },
          { value: h.orders.length },
          { value: h.overdue, tone: h.overdue ? "danger" : "muted" },
          { value: h.oldestDays },
        ]),
      };
    }
    case "notes-outstanding": {
      const visits = notesOutstanding(d);
      return {
        summary: `${visits.length} completed visits still need a finished note.`,
        columns: ["Visit date", "Patient", "Visit", "Clinician", "Note status", "Days since"],
        rows: visits.map((v) => {
          const since = daysBetween(dateOf(v.scheduled_at), today);
          return [
            { value: formatDate(v.scheduled_at) },
            patientCell(v.patient_id),
            { value: v.visit_type },
            { value: clinicians.get(v.clinician_id)?.full_name ?? "" },
            { value: statusLabel(v.note_status), tone: v.note_status === "returned" ? "danger" : "warning" },
            { value: since, tone: since > 2 ? "danger" : undefined },
          ];
        }),
      };
    }
    case "audit-backlog": {
      const audits = openAudits(d);
      return {
        summary: `${audits.length} open audits, ${audits.filter((a) => a.severity === "high").length} high severity.`,
        columns: ["Severity", "Patient", "Form", "Issue", "Owner", "Due", "Status"],
        rows: audits.map((a) => [
          { value: statusLabel(a.severity), tone: a.severity === "high" ? "danger" : a.severity === "medium" ? "warning" : "muted" },
          patientCell(a.patient_id),
          { value: a.form_type },
          { value: a.issue },
          { value: a.assigned_to ? clinicians.get(a.assigned_to)?.full_name ?? "" : "Unassigned" },
          { value: a.due_date ? formatDate(a.due_date) : "", tone: a.due_date && a.due_date < today ? "danger" : undefined },
          { value: statusLabel(a.status) },
        ]),
      };
    }
    case "missed-visits": {
      const from = addDays(today, -14);
      const missed = d.visits
        .filter((v) => v.status === "missed" && dateOf(v.scheduled_at) >= from)
        .sort((a, b) => b.scheduled_at.localeCompare(a.scheduled_at));
      return {
        summary: `${missed.length} missed visits in the last 14 days.`,
        columns: ["Date", "Patient", "Visit", "Clinician"],
        rows: missed.map((v) => [
          { value: formatDate(v.scheduled_at) },
          patientCell(v.patient_id),
          { value: v.visit_type },
          { value: clinicians.get(v.clinician_id)?.full_name ?? "" },
        ]),
      };
    }
    case "visits-by-clinician": {
      const rows = d.clinicians.map((c) => {
        const mine = d.visits.filter((v) => v.clinician_id === c.id);
        return {
          c,
          done: mine.filter((v) => v.status === "completed").length,
          upcoming: mine.filter((v) => v.status === "scheduled").length,
          missed: mine.filter((v) => v.status === "missed").length,
          notes: mine.filter((v) => v.status === "completed" && v.note_status !== "approved" && v.note_status !== "submitted").length,
        };
      });
      return {
        summary: `${d.visits.length} visits across ${d.clinicians.length} clinicians.`,
        columns: ["Clinician", "Discipline", "Completed", "Upcoming", "Missed", "Notes open"],
        rows: rows
          .sort((a, b) => b.done + b.upcoming - (a.done + a.upcoming))
          .map((r) => [
            { value: r.c.full_name },
            { value: r.c.discipline },
            { value: r.done },
            { value: r.upcoming },
            { value: r.missed, tone: r.missed ? "warning" : "muted" },
            { value: r.notes, tone: r.notes ? "danger" : "muted" },
          ]),
      };
    }
    case "recerts-due": {
      const list = episodesEndingSoon(d, today);
      return {
        summary: `${list.length} episodes end in the next 14 days.`,
        columns: ["Patient", "Diagnosis", "Episode ends", "Days left", "Physician"],
        rows: list.map((p) => {
          const left = daysBetween(today, p.episode_end);
          return [
            patientCell(p.id),
            { value: p.primary_diagnosis },
            { value: formatDate(p.episode_end) },
            { value: left, tone: left <= 5 ? "danger" : "warning" },
            { value: physicians.get(p.primary_physician_id)?.full_name ?? "" },
          ];
        }),
      };
    }
    case "census-by-payer": {
      const payers = [...new Set(d.patients.map((p) => p.payer))].sort();
      const statuses = ["active", "on_hold", "referral", "discharged"] as const;
      return {
        summary: `${d.patients.length} patients across ${payers.length} payers.`,
        columns: ["Payer", ...statuses.map(statusLabel), "Total"],
        rows: payers.map((payer) => {
          const mine = d.patients.filter((p) => p.payer === payer);
          return [
            { value: payer },
            ...statuses.map((s) => ({ value: mine.filter((p) => p.status === s).length })),
            { value: mine.length },
          ];
        }),
      };
    }
    default:
      return null;
  }
}
