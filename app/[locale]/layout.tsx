import { ReactNode } from "react";
export default function LocaleLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Segment [locale] jest walidowany w middleware; tu tylko renderujemy dzieci.
  return <div className="min-h-screen">{children}</div>;
}
