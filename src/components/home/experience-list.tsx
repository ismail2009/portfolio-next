import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowForward, Download } from "@/components/icons";
import { LocalizedText } from "@/components/localized-text";
import { Eyebrow, SectionTitle } from "@/components/section-heading";
import { getExperience, getProjects, getSettings, type ExperienceEntry } from "@/lib/content";
import { Stack } from "@/components/project-parts";

// The career reads as one story in three stages, newest first.
const PHASES = ["scaling", "building", "learning"] as const;

export async function ExperienceList() {
  const locale = await getLocale();
  const t = await getTranslations("Experience");
  const common = await getTranslations("Common");
  const [entries, settings, projects] = await Promise.all([getExperience(), getSettings(), getProjects()]);

  // Arabic uses the Levantine month names (كانون الثاني، شباط…) as written in Palestine.
  // Latin digits in both languages, matching the rest of the site.
  const dates = new Intl.DateTimeFormat(locale === "ar" ? "ar-PS" : locale, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
    numberingSystem: "latn",
  });
  const month = (date: string) => dates.format(new Date(`${date}T00:00:00Z`));

  // Entries linked to a case study show that app's icon, so the shipped product is recognisable.
  const icons = new Map(projects.map((project) => [project.slug, project]));

  // Every bar shares one scale, from the first start to the latest end, so overlapping work lines up.
  // A current role (no end date) runs to the latest date in the data, which keeps rendering pure.
  const parse = (date: string) => Date.parse(`${date}T00:00:00Z`);
  const known = entries.flatMap((entry) =>
    [entry.start, entry.end].filter((date) => date !== null).map(parse),
  );
  const first = Math.min(...known);
  const last = Math.max(...known);
  const time = (date: string | null) => (date ? parse(date) : last);
  const span = Math.max(last - first, 1);

  const years = (group: ExperienceEntry[]) => {
    const from = Math.min(...group.map((entry) => new Date(time(entry.start)).getUTCFullYear()));
    const to = Math.max(...group.map((entry) => new Date(time(entry.end)).getUTCFullYear()));
    return from === to ? `${from}` : `${from}–${to}`;
  };

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

        <div className="flex min-w-0 flex-[999_1_600px] flex-col gap-16">
          {PHASES.map((phase) => {
            const group = entries.filter((entry) => (entry.phase ?? "building") === phase);
            if (group.length === 0) return null;
            return (
              <section key={phase} aria-labelledby={`phase-${phase}`} className="flex flex-col">
                <header className="flex flex-col gap-1.5 pb-6">
                  <p className="m-0 font-mono text-[13px] tracking-[0.08em] text-accent-night">
                    <bdi>{years(group)}</bdi>
                  </p>
                  <h3
                    id={`phase-${phase}`}
                    className="m-0 font-display text-[32px] font-extrabold tracking-[-0.025em] text-white"
                  >
                    {t(`phases.${phase}.title`)}
                  </h3>
                  <p className="m-0 text-night-muted">{t(`phases.${phase}.lead`)}</p>
                </header>

                <ol className="m-0 list-none p-0">
                  {group.map((entry) => {
                    const icon = entry.caseStudy ? icons.get(entry.caseStudy)?.image : undefined;
                    const start = (time(entry.start) - first) / span;
                    const width = Math.max((time(entry.end) - time(entry.start)) / span, 0.012);
                    return (
                      <li
                        key={entry.slug}
                        className="flex flex-wrap gap-x-8 gap-y-2 border-t border-night-line py-8"
                      >
                        <div className="flex flex-[1_1_160px] flex-col gap-1">
                          {/* Each date stays on one line (Arabic month names like تشرين الأول are two words);
                              a role that starts and ends in the same month shows that month once. */}
                          <span className="font-mono text-[13px] text-accent-night rtl:font-sans">
                            {entry.start && <span className="whitespace-nowrap">{month(entry.start)}</span>}
                            {entry.end !== entry.start && (
                              <>
                                {" – "}
                                <span className="whitespace-nowrap">
                                  {entry.end ? month(entry.end) : t("present")}
                                </span>
                              </>
                            )}
                          </span>
                          <LocalizedText
                            value={entry.type}
                            locale={locale}
                            className="text-sm text-night-muted"
                          />
                          {/* Where this role sits in the whole career; roles that ran in parallel overlap. */}
                          <span
                            aria-hidden="true"
                            className="relative mt-2 block h-1 rounded-full bg-night-line"
                          >
                            <span
                              className="absolute inset-y-0 rounded-full bg-accent-night"
                              style={{ insetInlineStart: `${start * 100}%`, width: `${width * 100}%` }}
                            />
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-[999_1_320px] flex-col gap-2.5">
                          {/* The company's own logo first; otherwise the icon of the app shipped there.
                              It sits on its own line so wide wordmarks never push the title around. */}
                          {entry.logo && entry.logo.width < entry.logo.height * 1.5 ? (
                            // A square logo is an app-style icon, shown like the case study icons.
                            <Image
                              src={entry.logo.src}
                              alt=""
                              width={48}
                              height={48}
                              className="mb-1 size-12 rounded-xl bg-white object-contain p-1"
                            />
                          ) : entry.logo ? (
                            <span className="mb-1 flex h-12 items-center self-start rounded-xl bg-white px-3">
                              <Image
                                src={entry.logo.src}
                                alt=""
                                width={entry.logo.width}
                                height={entry.logo.height}
                                sizes="150px"
                                className="h-7 w-auto max-w-37"
                              />
                            </span>
                          ) : (
                            icon && (
                              <Image
                                src={icon}
                                alt=""
                                width={48}
                                height={48}
                                className="mb-1 size-12 rounded-xl bg-white object-contain p-1"
                              />
                            )
                          )}
                          <h4 className="m-0 font-display text-2xl font-semibold tracking-[-0.02em] text-white">
                            {locale === "ar" && entry.companyAr ? (
                              entry.companyAr
                            ) : (
                              <span lang="en">{entry.company}</span>
                            )}{" "}
                            <span className="font-medium text-night-muted">
                              · <LocalizedText value={entry.role} locale={locale} />
                            </span>
                          </h4>
                          <LocalizedText
                            as="p"
                            value={entry.outcome}
                            locale={locale}
                            className="m-0 text-[#d3d5d9]"
                          />
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
                    );
                  })}
                </ol>
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}
