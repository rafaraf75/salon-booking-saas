import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LangSwitcher } from "@/components/common/lang-switcher";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

import { AuthForm } from "./client";

export default async function AuthPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = getDictionary(locale);
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-orange-50/60 via-white to-white px-4 py-10">
      <div className="absolute right-6 top-6">
        <LangSwitcher currentLocale={locale} pathname={`/${locale}/auth`} />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-medium text-orange-900">
            Next.js + Supabase Auth
          </div>
          <CardTitle>
            {/* TODO: i18n keys for auth titles */}
            {dict["auth.title.login"]}
          </CardTitle>
          <CardDescription>
            {dict["auth.desc.login"]}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm locale={locale} dict={dict} />
          <div className="mt-4 text-center text-xs text-muted-foreground">
            <Link href={`/${locale}`} className="underline">
              {dict["auth.backHome"]}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
