"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

/** Switches language on the current page (e.g. a case study), not back to the home page. */
export function LanguageSwitch() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();
  const otherLocale = locale === "ar" ? "en" : "ar";

  return (
    <Link
      href={pathname}
      locale={otherLocale}
      className="flex h-11 items-center rounded-[10px] border border-line bg-surface px-3.5 text-sm font-semibold no-underline hover:border-line-strong"
    >
      {/* The accessible name starts with the visible text, so voice control can target it (WCAG 2.5.3). */}
      <span lang={otherLocale}>{t("switchLanguage")}</span>
      <span className="sr-only"> – {t("switchLanguageLabel")}</span>
    </Link>
  );
}
