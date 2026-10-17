import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getCaseStudies } from "@/lib/content";
import { siteUrl } from "@/lib/site";

// Each page is listed once per language, with both language versions as alternates.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cases = await getCaseStudies();
  const paths = ["", ...cases.map((project) => `/work/${project.slug}`)];

  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${siteUrl}/${locale}${path}`,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, `${siteUrl}/${l}${path}`])),
      },
    })),
  );
}
