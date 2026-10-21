import type { ElementType, ComponentPropsWithoutRef } from "react";
import { arabicSpacing, localize, renderedLang, type Localized } from "@/lib/content";

type Props<T extends ElementType> = {
  as?: T;
  value: Localized;
  locale: string;
} & Omit<ComponentPropsWithoutRef<T>, "children">;

/**
 * Renders a localized content value. When an Arabic page falls back to English,
 * the element gets lang="en" so screen readers switch voice, and dir="ltr" so the
 * English reads left to right (otherwise punctuation jumps to the wrong end).
 */
export function LocalizedText<T extends ElementType = "span">({ as, value, locale, ...props }: Props<T>) {
  const Tag: ElementType = as ?? "span";
  const lang = renderedLang(value, locale);
  const fallback = lang !== locale;
  const text = localize(value, locale);
  return (
    <Tag lang={fallback ? lang : undefined} dir={fallback ? "ltr" : undefined} {...props}>
      {lang === "ar" ? arabicSpacing(text) : text}
    </Tag>
  );
}
