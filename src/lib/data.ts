import "server-only";
import { connection } from "next/server";
import { generateDataset, runtimeClock } from "./demo-data";
import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";
import type { Dataset } from "./types";

/**
 * Loads everything the UI needs for the signed-in user's agency.
 *
 * Fine for a proof of concept with a few hundred rows. As data grows, swap
 * this for targeted queries per page (the page components only use the
 * helpers in insights.ts, so callers will not need to change much).
 */
export async function getDataset(): Promise<Dataset> {
  if (!isSupabaseConfigured) {
    // Demo data is relative to "now", so it must be generated per request.
    await connection();
    return generateDataset(runtimeClock());
  }

  const supabase = await createClient();
  const [clinicians, physicians, patients, visits, orders, audits] = await Promise.all([
    supabase.from("clinicians").select("id, full_name, discipline").eq("active", true),
    supabase.from("physicians").select("id, full_name, practice, phone, fax"),
    supabase.from("patients").select("*"),
    supabase.from("visits").select("id, patient_id, clinician_id, scheduled_at, discipline, visit_type, status, note_status"),
    supabase.from("physician_orders").select("id, patient_id, physician_id, order_type, status, sent_at, signed_at"),
    supabase.from("form_audits").select("id, patient_id, visit_id, form_type, issue, severity, status, assigned_to, due_date"),
  ]);

  const firstError = [clinicians, physicians, patients, visits, orders, audits].find((r) => r.error)?.error;
  if (firstError) throw new Error(`Could not load data from Supabase: ${firstError.message}`);

  return {
    clinicians: clinicians.data ?? [],
    physicians: physicians.data ?? [],
    patients: patients.data ?? [],
    visits: visits.data ?? [],
    orders: orders.data ?? [],
    audits: audits.data ?? [],
  };
}

export async function getCurrentUserName(): Promise<string> {
  if (!isSupabaseConfigured) return "Demo User";
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = (data?.claims?.email as string | undefined) ?? "";
  return email.split("@")[0] || "Signed in";
}
