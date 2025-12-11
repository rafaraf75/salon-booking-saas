"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { LangSwitcher } from "@/components/common/lang-switcher";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
};

export function AppShell({
  locale,
  userEmail,
  navItems,
  children,
}: {
  locale: string;
  userEmail?: string | null;
  navItems: NavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center justify-center rounded-md border px-2 py-2 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="text-lg font-semibold">Salon Panel</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <LangSwitcher currentLocale={locale as any} pathname={pathname} />
          <span className="text-muted-foreground">
            {userEmail ?? "Niezalogowany"} • {locale.toUpperCase()}
          </span>
          <form action="/auth/signout" method="post">
            <Button size="sm" variant="outline">
              Wyloguj
            </Button>
          </form>
        </div>
      </header>
      <div className="grid min-h-[calc(100vh-57px)] grid-cols-1 md:grid-cols-[220px_1fr]">
        <aside
          className={cn(
            "border-b bg-muted/30 px-4 py-4 md:border-b-0 md:border-r md:px-6 md:py-6",
            open ? "block" : "hidden md:block",
          )}
        >
          <nav className="flex flex-col gap-2 text-sm font-medium">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-2 transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
