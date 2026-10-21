import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "pasien" | "apoteker" | "admin";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user, loading };
}

export async function fetchUserRole(userId: string): Promise<AppRole | null> {
  const { data } = await supabase
    .from("user_roles" as never)
    .select("role")
    .eq("user_id", userId);
  const roles = ((data ?? []) as { role?: AppRole }[])
    .map((r) => r.role)
    .filter(Boolean) as AppRole[];
  if (roles.includes("admin")) return "admin";
  if (roles.includes("apoteker")) return "apoteker";
  if (roles.includes("pasien")) return "pasien";
  return null;
}

export function useRole(userId?: string | null) {
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!userId) {
      setRole(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchUserRole(userId)
      .then((r) => setRole(r))
      .finally(() => setLoading(false));
  }, [userId]);
  return { role, loading };
}
