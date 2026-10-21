import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AdherenceSummaryRow = {
  total: number;
  taken: number;
  on_time: number;
  late: number;
  missed: number;
  pct: number;
};

export type PatientFullDetail = {
  profile: {
    full_name: string | null;
    phone_number: string | null;
    gender: string | null;
    age: number | null;
    height: number | null;
    weight: number | null;
    address: string | null;
    emergency_contact: string | null;
    is_verified: boolean;
    target_sistolik: number | null;
    target_diastolik: number | null;
    target_kolesterol: number | null;
    target_gula_puasa: number | null;
    target_gula_pp: number | null;
  } | null;
  summary7: AdherenceSummaryRow;
  summary30: AdherenceSummaryRow;
  recentLogs: Array<{
    id: string;
    scheduled_date: string;
    scheduled_time: string | null;
    status: string | null;
    taken_at: string | null;
    medications: { name: string } | null;
  }>;
  measurements: Array<{
    id: string;
    disease_type: string;
    measurement_time: string;
    sistolik: number | null;
    diastolik: number | null;
    kolesterol: number | null;
    gula_puasa: number | null;
    gula_pp: number | null;
    is_abnormal: boolean | null;
    notes: string | null;
  }>;
  medications: Array<{
    id: string;
    name: string;
    disease_type: string;
    dosage: string | null;
    unit: string | null;
    quantity: number | null;
    instructions: string | null;
    schedule_time: string[];
    is_active: boolean | null;
    is_approved: boolean | null;
    created_at: string | null;
  }>;
  appointments: Array<{
    id: string;
    appointment_date: string;
    appointment_time: string | null;
    doctor_name: string | null;
    hospital_name: string | null;
    notes: string | null;
    is_confirmed: boolean | null;
    is_attended: boolean | null;
  }>;
  logbook: Array<{
    id: string;
    entry_date: string;
    title: string;
    content: string | null;
    recommendation: string | null;
    status: string;
  }>;
  consultations: Array<{
    id: string;
    title: string | null;
    description: string | null;
    status: string | null;
    priority: string | null;
    created_at: string | null;
  }>;
};

const EMPTY_SUMMARY: AdherenceSummaryRow = {
  total: 0,
  taken: 0,
  on_time: 0,
  late: 0,
  missed: 0,
  pct: 0,
};

export const getPatientFullDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => ({ userId: String(d.userId) }))
  .handler(async ({ data, context }): Promise<PatientFullDetail> => {
    const { data: staff } = await context.supabase.rpc("is_staff");
    if (!staff) throw new Error("Forbidden");
    return loadPatientFullDetail(context.supabase, data.userId);
  });

// Runs with any Supabase client (browser or server); RLS restricts to staff.
export async function loadPatientFullDetail(sb: SupabaseClient<Database>, uid: string): Promise<PatientFullDetail> {
    const context = { supabase: sb };
    {
    const since7 = new Date();
    since7.setDate(since7.getDate() - 6);
    const since30 = new Date();
    since30.setDate(since30.getDate() - 29);
    const s7 = since7.toISOString().slice(0, 10);
    const s30 = since30.toISOString().slice(0, 10);

    const [profile, sum7, sum30, logs, meas, meds, appts, book, consults] = await Promise.all([
      context.supabase
        .from("profiles")
        .select(
          "full_name, phone_number, gender, age, height, weight, address, emergency_contact, is_verified, target_sistolik, target_diastolik, target_kolesterol, target_gula_puasa, target_gula_pp",
        )
        .eq("user_id", uid)
        .maybeSingle(),
      context.supabase.rpc("get_adherence_summary", { _user_id: uid, _days: 7 } as never),
      context.supabase.rpc("get_adherence_summary", { _user_id: uid, _days: 30 } as never),
      context.supabase
        .from("adherence_logs")
        .select(
          "id, scheduled_date, scheduled_time, status, taken_at, medications(name)",
        )
        .eq("user_id", uid)
        .gte("scheduled_date", s7)
        .order("scheduled_date", { ascending: false })
        .order("scheduled_time", { ascending: false })
        .limit(50),
      context.supabase
        .from("measurements")
        .select(
          "id, disease_type, measurement_time, sistolik, diastolik, kolesterol, gula_puasa, gula_pp, is_abnormal, notes",
        )
        .eq("user_id", uid)
        .order("measurement_time", { ascending: false })
        .limit(15),
      context.supabase
        .from("medications")
        .select(
          "id, name, disease_type, dosage, unit, quantity, instructions, schedule_time, is_active, is_approved, created_at",
        )
        .eq("user_id", uid)
        .order("created_at", { ascending: false }),
      context.supabase
        .from("appointments")
        .select(
          "id, appointment_date, appointment_time, doctor_name, hospital_name, notes, is_confirmed, is_attended",
        )
        .eq("user_id", uid)
        .order("appointment_date", { ascending: false })
        .limit(10),
      context.supabase
        .from("patient_logbook")
        .select("id, entry_date, title, content, recommendation, status")
        .eq("user_id", uid)
        .order("entry_date", { ascending: false })
        .limit(10),
      context.supabase
        .from("consultation_requests")
        .select("id, title, description, status, priority, created_at")
        .eq("patient_id", uid)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    if (profile.error) throw new Error(profile.error.message);

    const pickSummary = (rows: unknown): AdherenceSummaryRow => {
      const r = Array.isArray(rows) ? rows[0] : (rows as AdherenceSummaryRow | null);
      return r ?? EMPTY_SUMMARY;
    };

    return {
      profile: (profile.data as PatientFullDetail["profile"]) ?? null,
      summary7: pickSummary(sum7.data),
      summary30: pickSummary(sum30.data),
      recentLogs: (logs.data as PatientFullDetail["recentLogs"]) ?? [],
      measurements: (meas.data as PatientFullDetail["measurements"]) ?? [],
      medications: (meds.data as PatientFullDetail["medications"]) ?? [],
      appointments: (appts.data as PatientFullDetail["appointments"]) ?? [],
      logbook: (book.data as PatientFullDetail["logbook"]) ?? [],
      consultations: (consults.data as PatientFullDetail["consultations"]) ?? [],
    };
    }
}
