import Link from "next/link";

import { locales, type Locale } from "@/i18n/config";

export function LangSwitcher({
  currentLocale,
  pathname,
}: {
  currentLocale: Locale;
  pathname: string;
}) {
  const segments = pathname.split("/").filter(Boolean);
  const [, ...rest] = segments; // remove current locale
  const targetPath = rest.length ? `/${rest.join("/")}` : "";

  return (
    <div className="flex items-center gap-2 text-sm">
      {locales.map((locale) => (
        <Link
          key={locale}
          href={`/${locale}${targetPath ? `/${targetPath}` : ""}`}
          className={`rounded-md px-2 py-1 ${
            locale === currentLocale
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          {locale.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
