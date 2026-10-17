import type { ElementType, ComponentPropsWithoutRef } from "react";
import { localize, renderedLang, type Localized } from "@/lib/content";

type Props<T extends ElementType> = {
  as?: T;
  value: Localized;
  locale: string;
} & Omit<ComponentPropsWithoutRef<T>, "children">;

/**
 * Renders a localized content value. When an Arabic page falls back to English,
 * the element gets lang="en" so screen readers switch voice.
 */
export function LocalizedText<T extends ElementType = "span">({ as, value, locale, ...props }: Props<T>) {
  const Tag: ElementType = as ?? "span";
  const lang = renderedLang(value, locale);
  return (
    <Tag lang={lang !== locale ? lang : undefined} {...props}>
      {localize(value, locale)}
    </Tag>
  );
}
