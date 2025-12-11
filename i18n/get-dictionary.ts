import es from "@/messages/es.json";
import pl from "@/messages/pl.json";
import en from "@/messages/en.json";

import type { Locale } from "./config";

const dictionaries: Record<Locale, Record<string, string>> = {
  es,
  pl,
  en,
};

export const getDictionary = (locale: Locale) => {
  return dictionaries[locale] ?? dictionaries.es;
};
