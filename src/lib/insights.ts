// Pure functions that turn raw rows into the things people actually look for.
// Pages and reports share these, so a number on the dashboard always matches
// the number in the report behind it.

import type { Dataset, FormAudit, Patient, PhysicianOrder, Visit } from "./types";
import { dateOf, daysBetween } from "./time";

export const ORDER_OVERDUE_DAYS = 30;

export function indexById<T extends { id: string }>(rows: T[]): Map<string, T> {
  return new Map(rows.map((r) => [r.id, r]));
}

export function patientName(p: Pick<Patient, "first_name" | "last_name"> | undefined) {
  return p ? `${p.last_name}, ${p.first_name}` : "Unknown patient";
}

export function visitsOn(d: Dataset, isoDate: string): Visit[] {
  return d.visits
    .filter((v) => dateOf(v.scheduled_at) === isoDate)
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
}

export interface OpenOrder extends PhysicianOrder {
  daysOut: number;
}

export function unsignedOrders(d: Dataset, today: string): OpenOrder[] {
  return d.orders
    .filter((o) => o.status === "sent" && o.sent_at)
    .map((o) => ({ ...o, daysOut: daysBetween(dateOf(o.sent_at!), today) }))
    .sort((a, b) => b.daysOut - a.daysOut);
}

export interface HotlistEntry {
  physicianId: string;
  name: string;
  practice: string;
  phone: string;
  fax: string;
  orders: OpenOrder[];
  overdue: number;
  oldestDays: number;
}

/** Physicians with unsigned orders, worst first. */
export function physicianHotlist(d: Dataset, today: string): HotlistEntry[] {
  const physicians = indexById(d.physicians);
  const byPhysician = new Map<string, OpenOrder[]>();
  for (const o of unsignedOrders(d, today)) {
    byPhysician.set(o.physician_id, [...(byPhysician.get(o.physician_id) ?? []), o]);
  }
  return [...byPhysician.entries()]
    .map(([physicianId, orders]) => {
      const p = physicians.get(physicianId);
      return {
        physicianId,
        name: p?.full_name ?? "Unknown physician",
        practice: p?.practice ?? "",
        phone: p?.phone ?? "",
        fax: p?.fax ?? "",
        orders,
        overdue: orders.filter((o) => o.daysOut > ORDER_OVERDUE_DAYS).length,
        oldestDays: Math.max(...orders.map((o) => o.daysOut)),
      };
    })
    .sort((a, b) => b.overdue - a.overdue || b.oldestDays - a.oldestDays);
}

export function openAudits(d: Dataset): FormAudit[] {
  const rank = { high: 0, medium: 1, low: 2 };
  return d.audits
    .filter((a) => a.status !== "resolved")
    .sort((a, b) => rank[a.severity] - rank[b.severity] || (a.due_date ?? "").localeCompare(b.due_date ?? ""));
}

/** Completed visits whose note still needs the clinician's attention. */
export function notesOutstanding(d: Dataset): Visit[] {
  return d.visits
    .filter((v) => v.status === "completed" && ["not_started", "draft", "returned"].includes(v.note_status))
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
}

export function episodesEndingSoon(d: Dataset, today: string, withinDays = 14): Patient[] {
  return d.patients
    .filter((p) => p.status === "active")
    .filter((p) => {
      const left = daysBetween(today, p.episode_end);
      return left >= 0 && left <= withinDays;
    })
    .sort((a, b) => a.episode_end.localeCompare(b.episode_end));
}

export function kpis(d: Dataset, today: string) {
  const todays = visitsOn(d, today);
  const orders = unsignedOrders(d, today);
  return {
    visitsToday: todays.length,
    visitsDone: todays.filter((v) => v.status === "completed").length,
    unsignedOrders: orders.length,
    overdueOrders: orders.filter((o) => o.daysOut > ORDER_OVERDUE_DAYS).length,
    openAudits: openAudits(d).length,
    highAudits: openAudits(d).filter((a) => a.severity === "high").length,
    notesOutstanding: notesOutstanding(d).length,
    activePatients: d.patients.filter((p) => p.status === "active").length,
  };
}
