import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DISCLAIMER } from "@/lib/health-utils";

export type Branding = {
  appName: string;
  heroTitle: string;
  heroHighlight: string;
  heroDescription: string;
  ctaLabel: string;
  footerLine1: string;
  footerLine2: string;
  disclaimer: string;
  primaryColor: string;
  staffTitle: string;
  staffAnnouncement: string;
  staffMenuDashboard: string;
  staffMenuPasien: string;
  staffMenuObat: string;
  staffMenuKepatuhan: string;
  staffMenuKonsultasi: string;
  staffMenuEdukasi: string;
  patientTitle: string;
  patientAnnouncement: string;
  patientMenuDashboard: string;
  patientMenuCatat: string;
  patientMenuRiwayat: string;
  patientMenuObat: string;
  patientMenuProfil: string;
  adminTitle: string;
  adminAnnouncement: string;
  adminMenuDashboard: string;
  adminMenuUsers: string;
  adminMenuAudit: string;
  adminMenuBackup: string;
  adminMenuPengaturan: string;
};

export const DEFAULT_BRANDING: Branding = {
  appName: "IMO MANTAP",
  heroTitle: "Kelola Kesehatanmu",
  heroHighlight: "dengan Mudah",
  heroDescription:
    "Solusi cerdas monitoring kesehatan harian yang praktis dan modern untuk keluarga Indonesia.",
  ctaLabel: "Mulai Sekarang",
  footerLine1: "IMO MANTAP Versi 2",
  footerLine2: "Created By Universitas Borneo Lestari",
  disclaimer: DISCLAIMER,
  primaryColor: "",
  staffTitle: "Tenaga Medis",
  staffAnnouncement: "",
  staffMenuDashboard: "Dashboard",
  staffMenuPasien: "Pasien",
  staffMenuObat: "Obat",
  staffMenuKepatuhan: "Kepatuhan",
  staffMenuKonsultasi: "Konsultasi",
  staffMenuEdukasi: "Edukasi",
  patientTitle: "",
  patientAnnouncement: "",
  patientMenuDashboard: "Dashboard",
  patientMenuCatat: "Catat",
  patientMenuRiwayat: "Riwayat",
  patientMenuObat: "Obat",
  patientMenuProfil: "Profil",
  adminTitle: "Admin",
  adminAnnouncement: "",
  adminMenuDashboard: "Dashboard",
  adminMenuUsers: "Users",
  adminMenuAudit: "Audit",
  adminMenuBackup: "Backup",
  adminMenuPengaturan: "Pengaturan",
};

let cache: Branding | null = null;
const listeners = new Set<(b: Branding) => void>();

export function applyBrandColor(color: string) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (color) {
    root.style.setProperty("--primary", color);
    root.style.setProperty("--ring", color);
  } else {
    root.style.removeProperty("--primary");
    root.style.removeProperty("--ring");
  }
}

export function publishBranding(b: Branding) {
  cache = b;
  applyBrandColor(b.primaryColor);
  listeners.forEach((l) => l(b));
}

async function loadBranding() {
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "branding")
    .maybeSingle();
  publishBranding({ ...DEFAULT_BRANDING, ...((data?.value as Partial<Branding>) ?? {}) });
}

export function useBranding(): Branding {
  const [b, setB] = useState<Branding>(cache ?? DEFAULT_BRANDING);
  useEffect(() => {
    listeners.add(setB);
    if (cache) setB(cache);
    else loadBranding();
    return () => {
      listeners.delete(setB);
    };
  }, []);
  return b;
}
