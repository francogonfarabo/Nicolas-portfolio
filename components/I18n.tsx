"use client";

import { createContext, useContext } from "react";
import type { Locale } from "@/content/types";
import { type Dict, dictionaries } from "@/lib/i18n";

const Ctx = createContext<{ locale: Locale; t: Dict }>({ locale: "en", t: dictionaries.en });

/** Gives client components the UI strings for the page's language. */
export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <Ctx.Provider value={{ locale, t: dictionaries[locale] }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
