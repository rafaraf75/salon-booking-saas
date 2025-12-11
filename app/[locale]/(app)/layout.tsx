import { ReactNode } from "react";

import { AppShell } from "@/components/common/app-shell";
import { locales, type Locale } from "@/i18n/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function AppLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const navItems = [
    { href: `/${locale}/(app)/dashboard`, label: "Dashboard" },
    { href: `/${locale}/(app)/calendar`, label: "Kalendarz" },
    { href: `/${locale}/(app)/settings`, label: "Ustawienia" },
  ];

  return (
    <AppShell locale={locale} userEmail={user?.email} navItems={navItems}>
      {children}
    </AppShell>
  );
}
