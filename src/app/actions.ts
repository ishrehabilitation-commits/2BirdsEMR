"use server";

import { getDataset } from "@/lib/data";
import { patientName } from "@/lib/insights";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export interface PatientHit {
  id: string;
  name: string;
  mrn: string;
  detail: string;
}

/** Backs patient search in the command palette. */
export async function searchPatients(query: string): Promise<PatientHit[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const { patients } = await getDataset();
  return patients
    .filter((p) => `${p.first_name} ${p.last_name} ${p.mrn} ${p.primary_diagnosis}`.toLowerCase().includes(q))
    .slice(0, 8)
    .map((p) => ({ id: p.id, name: patientName(p), mrn: p.mrn, detail: p.primary_diagnosis }));
}

export async function submitFeedback(input: { message: string; sentiment: -1 | 0 | 1; page: string }) {
  const message = input.message.trim().slice(0, 4000);
  if (!message) return { ok: false as const, error: "Please write a few words first." };

  if (!isSupabaseConfigured) {
    // Demo mode has nowhere to store it; log so it shows up in Vercel logs.
    console.log("[feedback]", JSON.stringify({ ...input, message }));
    return { ok: true as const };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  const { data: profile } = await supabase.from("staff_profiles").select("agency_id").eq("id", userId).maybeSingle();
  const { error } = await supabase.from("feedback").insert({
    user_id: userId,
    agency_id: profile?.agency_id,
    page: input.page,
    message,
    sentiment: input.sentiment,
  });
  return error ? { ok: false as const, error: error.message } : { ok: true as const };
}
