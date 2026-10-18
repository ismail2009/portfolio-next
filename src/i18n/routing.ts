import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  localePrefix: "always",
  // Pages declare their own hreflang alternates in metadata; the middleware's Link header would
  // repeat them with the request host and a different x-default.
  alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];

export function isRtl(locale: string) {
  return locale === "ar";
}
