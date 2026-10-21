import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  } as never);
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

export const getUserEmails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userIds: string[] }) => ({
    userIds: (Array.isArray(d.userIds) ? d.userIds : []).slice(0, 200).map(String),
  }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const emails: Record<string, string> = {};
    const banned: Record<string, boolean> = {};
    if (data.userIds.length === 0) return { emails, banned };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    for (const id of data.userIds) {
      const { data: u } = await supabaseAdmin.auth.admin.getUserById(id);
      if (u?.user?.email) emails[id] = u.user.email;
      const until = (u?.user as any)?.banned_until;
      banned[id] = !!until && new Date(until).getTime() > Date.now();
    }
    return { emails, banned };
  });

export const setUserActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; active: boolean }) => ({
    userId: String(d.userId ?? ""),
    active: !!d.active,
  }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    if (!data.userId) return { ok: false, error: "User tidak valid" };
    if (data.userId === context.userId)
      return { ok: false, error: "Tidak bisa menonaktifkan akun sendiri" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      ban_duration: data.active ? "none" : "876000h",
    } as never);
    if (error) return { ok: false, error: error.message };
    await context.supabase.from("system_audit_logs").insert({
      user_id: context.userId,
      action: data.active ? "activate_user" : "deactivate_user",
      table_name: "auth.users",
      record_id: data.userId,
    } as never);
    return { ok: true };
  });

export const deleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string }) => ({ userId: String(d.userId ?? "") }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    if (!data.userId) return { ok: false, error: "User tidak valid" };
    if (data.userId === context.userId)
      return { ok: false, error: "Tidak bisa menghapus akun sendiri" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) return { ok: false, error: error.message };
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    await supabaseAdmin.from("profiles").delete().eq("user_id", data.userId);
    await context.supabase.from("system_audit_logs").insert({
      user_id: context.userId,
      action: "delete_user",
      table_name: "auth.users",
      record_id: data.userId,
    } as never);
    return { ok: true };
  });

export const resetUserPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { userId: string; newPassword: string }) => ({
    userId: String(d.userId ?? ""),
    newPassword: String(d.newPassword ?? ""),
  }))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    if (!data.userId) return { ok: false, error: "User tidak valid" };
    if (data.newPassword.length < 8)
      return { ok: false, error: "Password minimal 8 karakter" };
    if (data.newPassword.length > 72)
      return { ok: false, error: "Password terlalu panjang (maks. 72 karakter)" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      password: data.newPassword,
    });
    if (error) {
      const msg = /weak|easy to guess/i.test(error.message)
        ? "Password terlalu mudah ditebak. Gunakan kombinasi huruf, angka, dan simbol."
        : error.message;
      return { ok: false, error: msg };
    }
    await context.supabase.from("system_audit_logs").insert({
      user_id: context.userId,
      action: "reset_password",
      table_name: "auth.users",
      record_id: data.userId,
    } as never);
    return { ok: true };
  });
