import Link from "next/link";
import { ReactNode } from "react";

import { LangSwitcher } from "@/components/common/lang-switcher";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="min-h-screen bg-background">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4">
        <div className="text-lg font-semibold">Salon Panel</div>
        <div className="flex items-center gap-4 text-sm">
          <LangSwitcher currentLocale={locale} pathname={`/${locale}/(app)/dashboard`} />
          <span className="text-muted-foreground">
            {user?.email ?? "Niezalogowany"} • {locale?.toUpperCase() || "ES"}
          </span>
          <form action="/auth/signout" method="post">
            <Button size="sm" variant="outline">
              Wyloguj
            </Button>
          </form>
        </div>
      </header>
      <main className="px-6 py-8">
        <div className="mb-4 flex gap-3 text-sm text-muted-foreground">
          <Link href={`/${locale}/(app)/dashboard`} className="underline">
            Dashboard
          </Link>
          <Link href={`/${locale}/(app)/calendar`} className="underline">
            Kalendarz
          </Link>
          <Link href={`/${locale}/(app)/settings`} className="underline">
            Ustawienia
          </Link>
        </div>
        {children}
      </main>
    </div>
  );
}
