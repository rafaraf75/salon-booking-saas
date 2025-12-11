export const defaultLocale = "es" as const;
export const locales = ["es", "pl", "en"] as const;

export type Locale = (typeof locales)[number];
