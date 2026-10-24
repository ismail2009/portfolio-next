import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { profileMarkdown } from "@/lib/profile-markdown";

// /en/profile.md and /ar/profile.md: the profile as Markdown for AI assistants, built with the site.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function GET(_request: Request, { params }: RouteContext<"/[locale]/profile.md">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return new Response("Not found", { status: 404 });

  return new Response(await profileMarkdown(locale), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
