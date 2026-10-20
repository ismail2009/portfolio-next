import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { ArrowForward, Check } from "@/components/icons";
import { ExternalLink } from "@/components/external-link";
import { LocalizedText } from "@/components/localized-text";
import { LogoTile, ScreenStrip, Stack, StoreLinks } from "@/components/project-parts";
import { Eyebrow } from "@/components/section-heading";
import { getCaseStudies, getCaseStudy, getSettings, localize, type Localized } from "@/lib/content";

export async function generateStaticParams() {
  return (await getCaseStudies()).map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[locale]/work/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await getCaseStudy(slug);
  if (!project) return {};
  const t = await getTranslations({ locale, namespace: "Case" });

  return {
    title: t("metaTitle", { title: project.title }),
    description: localize(project.outcome, locale),
    alternates: {
      canonical: `/${locale}/work/${slug}`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/work/${slug}`])),
    },
    // openGraph replaces the layout's object rather than merging, so the shared fields are repeated.
    openGraph: {
      type: "article",
      siteName: "Ismail Al-Saleh",
      locale: locale === "ar" ? "ar" : "en_US",
      title: project.title,
      description: localize(project.outcome, locale),
    },
  };
}

export default async function CaseStudyPage({ params }: PageProps<"/[locale]/work/[slug]">) {
  const { locale, slug } = await params;
  const [project, cases, settings] = await Promise.all([getCaseStudy(slug), getCaseStudies(), getSettings()]);
  if (!project) notFound();

  const t = await getTranslations({ locale, namespace: "Case" });
  const others = cases.filter((item) => item.slug !== project.slug);

  const facts: { label: string; value: Localized | string }[] = [
    { label: t("client"), value: project.client },
    { label: t("year"), value: project.year },
    { label: t("platforms"), value: project.category },
    { label: t("proof"), value: project.metric },
  ].filter((fact) => (typeof fact.value === "string" ? fact.value : fact.value.en));

  return (
    <article>
      <header className="mx-auto flex max-w-page flex-col gap-7 px-6 pt-16 pb-12 md:pt-20">
        <Link
          href={{ pathname: "/", hash: "work" }}
          className="inline-flex items-center gap-2 self-start py-2 text-[15px] font-semibold hover:text-accent"
        >
          <ArrowForward size={16} className="rotate-180 rtl:rotate-0" />
          {t("back")}
        </Link>
        <Eyebrow>
          <span>{t("eyebrow", { title: project.title })}</span>
        </Eyebrow>
        <LocalizedText
          as="h1"
          value={project.outcome}
          locale={locale}
          className="m-0 max-w-[980px] font-display text-[clamp(38px,5.4vw,68px)] leading-[1.04] font-extrabold tracking-[-0.035em] rtl:leading-[1.25]"
        />

        {facts.length > 0 && (
          <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))] border-t border-line">
            {facts.map((fact) => (
              <div key={fact.label} className="flex flex-col gap-1 pe-5 pt-5">
                <dt className="font-mono text-[12.5px] tracking-[0.06em] text-muted uppercase">
                  {fact.label}
                </dt>
                <dd className="m-0 font-semibold">
                  {typeof fact.value === "string" ? (
                    <bdi>{fact.value}</bdi>
                  ) : (
                    <LocalizedText value={fact.value} locale={locale} />
                  )}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <StoreLinks project={project} locale={locale} />
        </div>
      </header>

      <div className="mx-auto max-w-page px-6 pb-24">
        <div className="flex min-h-80 items-center justify-center rounded-[28px] bg-sunken p-12 md:min-h-[420px]">
          <LogoTile project={project} locale={locale} size="hero" priority />
        </div>
      </div>

      {project.screenshots.length > 0 && (
        <section aria-labelledby="case-screens" className="mx-auto flex max-w-page flex-col gap-6 px-6 pb-24">
          <h2 id="case-screens" className="m-0 font-display text-[32px] font-extrabold tracking-[-0.025em]">
            {t("screens")}
          </h2>
          <ScreenStrip project={project} locale={locale} labelledBy="case-screens" />
        </section>
      )}

      <div className="mx-auto flex max-w-page flex-wrap gap-16 px-6 pb-28">
        <div className="flex min-w-0 flex-[999_1_600px] flex-col gap-16">
          {project.problem.en && (
            <section aria-labelledby="case-problem" className="flex flex-col gap-4">
              <h2
                id="case-problem"
                className="m-0 font-display text-[32px] font-extrabold tracking-[-0.025em]"
              >
                {t("problem")}
              </h2>
              <LocalizedText
                as="p"
                value={project.problem}
                locale={locale}
                className="m-0 max-w-[680px] text-[19px] text-ink-soft"
              />
            </section>
          )}

          {project.decisions.length > 0 && (
            <section aria-labelledby="case-decisions" className="flex flex-col gap-6">
              <h2
                id="case-decisions"
                className="m-0 font-display text-[32px] font-extrabold tracking-[-0.025em]"
              >
                {t("decisions")}
              </h2>
              <ol className="m-0 flex list-none flex-col p-0">
                {project.decisions.map((decision, index) => (
                  <li key={decision.en} className="flex gap-4 border-t border-line py-6">
                    <span aria-hidden="true" className="w-10 shrink-0 pt-0.5 font-mono text-sm text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <LocalizedText value={decision} locale={locale} className="text-[17px] text-ink-soft" />
                  </li>
                ))}
              </ol>
            </section>
          )}

          {project.shipped.length > 0 && (
            <section aria-labelledby="case-shipped" className="flex flex-col gap-6">
              <h2
                id="case-shipped"
                className="m-0 font-display text-[32px] font-extrabold tracking-[-0.025em]"
              >
                {t("shipped")}
              </h2>
              <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-4 p-0">
                {project.shipped.map((item) => (
                  <li
                    key={item.en}
                    className="flex items-start gap-3 rounded-[18px] border border-line bg-surface p-6"
                  >
                    <span className="pt-0.5 text-accent">
                      <Check size={20} />
                    </span>
                    <LocalizedText value={item} locale={locale} className="font-semibold" />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="min-w-0 flex-[1_1_300px]">
          <div className="sticky top-24 flex flex-col gap-6 rounded-[22px] border border-line bg-surface p-7">
            {project.role.en && (
              <div className="flex flex-col gap-1">
                <p className="m-0 font-mono text-[12.5px] tracking-[0.06em] text-muted uppercase">
                  {t("role")}
                </p>
                <LocalizedText value={project.role} locale={locale} className="font-semibold" />
                {project.engagement.en && (
                  <LocalizedText
                    value={project.engagement}
                    locale={locale}
                    className="text-[15px] text-muted"
                  />
                )}
              </div>
            )}
            <div className="flex flex-col gap-2.5">
              <p className="m-0 font-mono text-[12.5px] tracking-[0.06em] text-muted uppercase">
                {t("stack")}
              </p>
              <Stack items={project.stack} />
            </div>
            {settings.calendly && (
              <div className="flex flex-col gap-3 border-t border-line pt-5">
                <p className="m-0 font-semibold">{t("ctaTitle")}</p>
                <p className="m-0 text-[15px] text-body">{t("ctaBody")}</p>
                <ExternalLink
                  href={settings.calendly}
                  className="flex h-12 items-center justify-center rounded-xl bg-accent text-[15px] font-semibold text-white hover:bg-ink"
                >
                  {t("ctaButton")}
                </ExternalLink>
              </div>
            )}
          </div>
        </aside>
      </div>

      {others.length > 0 && (
        <section aria-labelledby="case-more" className="bg-night text-night-text">
          <div className="mx-auto flex max-w-page flex-col gap-8 px-6 py-24">
            <h2
              id="case-more"
              className="m-0 font-mono text-[13px] font-normal tracking-[0.08em] text-accent-night uppercase"
            >
              {t("more")}
            </h2>
            <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-6 p-0">
              {others.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/work/${item.slug}`}
                    className="flex h-full flex-col gap-3 rounded-[22px] border border-[#2a2e36] bg-[#15181e] p-8 text-night-text hover:border-accent-night"
                  >
                    <LocalizedText
                      value={item.category}
                      locale={locale}
                      className="font-mono text-[13px] text-night-muted"
                    />
                    <span className="flex items-center gap-2 font-display text-[30px] font-extrabold tracking-[-0.025em] text-white">
                      <span lang="en">{item.title}</span>
                      <ArrowForward size={22} />
                    </span>
                    <LocalizedText value={item.outcome} locale={locale} className="text-[#c9ccd2]" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}
