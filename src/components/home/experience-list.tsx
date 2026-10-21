import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowForward, Download } from "@/components/icons";
import { LocalizedText } from "@/components/localized-text";
import { Eyebrow, SectionTitle } from "@/components/section-heading";
import { getExperience, getSettings } from "@/lib/content";
import { Stack } from "@/components/project-parts";

export async function ExperienceList() {
  const locale = await getLocale();
  const t = await getTranslations("Experience");
  const common = await getTranslations("Common");
  const [entries, settings] = await Promise.all([getExperience(), getSettings()]);

  // Arabic uses the Levantine month names (كانون الثاني، شباط…) as written in Palestine.
  // Latin digits in both languages, matching the rest of the site.
  const dates = new Intl.DateTimeFormat(locale === "ar" ? "ar-PS" : locale, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
    numberingSystem: "latn",
  });
  const month = (date: string) => dates.format(new Date(`${date}T00:00:00Z`));

  return (
    <section
      id="experience"
      aria-labelledby="experience-title"
      className="scroll-mt-16 bg-night text-night-text"
    >
      <div className="mx-auto flex max-w-page flex-wrap gap-14 px-6 py-28">
        <div className="min-w-0 flex-[1_1_300px]">
          <div className="sticky top-24 flex flex-col gap-5">
            <Eyebrow tone="dark">{t("eyebrow")}</Eyebrow>
            <SectionTitle id="experience-title">{t("title")}</SectionTitle>
            <p className="m-0 text-night-muted">{t("lead")}</p>
            {settings.cvUrl && (
              <a
                href={settings.cvUrl}
                className="flex h-12 items-center gap-2.5 self-start rounded-xl bg-white px-5 text-[15px] font-semibold text-ink hover:bg-accent-night"
              >
                <Download />
                {t("cv")}
              </a>
            )}
          </div>
        </div>

        <ol className="m-0 min-w-0 flex-[999_1_600px] list-none p-0">
          {entries.map((entry) => (
            <li key={entry.slug} className="flex flex-wrap gap-x-8 gap-y-2 border-t border-night-line py-8">
              <div className="flex flex-[1_1_160px] flex-col gap-1">
                {/* Each date stays on one line (Arabic month names like تشرين الأول are two words);
                    a role that starts and ends in the same month shows that month once. */}
                <span className="font-mono text-[13px] text-accent-night rtl:font-sans">
                  {entry.start && <span className="whitespace-nowrap">{month(entry.start)}</span>}
                  {entry.end !== entry.start && (
                    <>
                      {" – "}
                      <span className="whitespace-nowrap">{entry.end ? month(entry.end) : t("present")}</span>
                    </>
                  )}
                </span>
                <LocalizedText value={entry.type} locale={locale} className="text-sm text-night-muted" />
              </div>
              <div className="flex min-w-0 flex-[999_1_320px] flex-col gap-2.5">
                <h3 className="m-0 font-display text-2xl font-semibold tracking-[-0.02em] text-white">
                  {locale === "ar" && entry.companyAr ? (
                    entry.companyAr
                  ) : (
                    <span lang="en">{entry.company}</span>
                  )}{" "}
                  <span className="font-medium text-night-muted">
                    · <LocalizedText value={entry.role} locale={locale} />
                  </span>
                </h3>
                <LocalizedText as="p" value={entry.outcome} locale={locale} className="m-0 text-[#d3d5d9]" />
                <Stack items={entry.tags} tone="dark" />
                {entry.caseStudy && (
                  <Link
                    href={`/work/${entry.caseStudy}`}
                    className="inline-flex items-center gap-2 self-start py-2 text-[15px] font-semibold text-accent-night underline underline-offset-4 hover:text-white"
                  >
                    {common("readCase")}
                    <ArrowForward size={16} />
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
