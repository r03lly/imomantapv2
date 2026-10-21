import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const patientInput = z.object({ userId: z.string().uuid() });

export const approvePatient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(patientInput)
  .handler(async ({ data, context }) => {
    const { data: staff, error: staffError } = await context.supabase.rpc("is_staff");
    if (staffError || !staff) throw new Error("Hanya tenaga medis atau admin yang dapat menyetujui pasien.");
    const { data: roles, error: rolesError } = await context.supabase.from("user_roles").select("role").eq("user_id", data.userId);
    if (rolesError || !roles?.length || roles.some((r) => r.role !== "pasien")) throw new Error("Akun ini bukan akun pasien.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: account, error: accountError } = await supabaseAdmin.auth.admin.getUserById(data.userId);
    if (accountError || !account.user) throw new Error("Akun pasien tidak ditemukan.");
    // Phone aliases cannot receive email; staff approval activates only these aliases.
    const phoneAlias = /^[0-9]+@hp\.imomantap\.com$/.test(account.user.email ?? "");
    if (phoneAlias && !account.user.email_confirmed_at) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, { email_confirm: true });
      if (error) throw new Error(error.message);
    }
    const { data: profile, error } = await context.supabase.from("profiles")
      .update({ is_verified: true, verified_by: context.userId })
      .eq("user_id", data.userId).select("*").single();
    if (error) throw new Error(error.message);
    return profile;
  });

export const resetPatientPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(patientInput.extend({ newPassword: z.string().min(8).max(72) }))
  .handler(async ({ data, context }) => {
    const { data: staff, error: staffError } = await context.supabase.rpc("is_staff");
    if (staffError || !staff) throw new Error("Hanya tenaga medis atau admin yang dapat mereset password pasien.");
    const { data: roles, error: rolesError } = await context.supabase.from("user_roles").select("role").eq("user_id", data.userId);
    if (rolesError || !roles?.length || roles.some((r) => r.role !== "pasien")) throw new Error("Password akun tenaga medis atau admin tidak dapat diubah melalui halaman pasien.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, { password: data.newPassword });
    if (error) throw new Error(error.message);
    await context.supabase.from("system_audit_logs").insert({ user_id: context.userId, action: "reset_patient_password", table_name: "auth.users", record_id: data.userId });
    return { ok: true };
  });