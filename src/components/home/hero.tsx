import { getLocale, getTranslations } from "next-intl/server";
import { ArrowForward, Calendar, Download } from "@/components/icons";
import { ExternalLink } from "@/components/external-link";
import { LocalizedText } from "@/components/localized-text";
import { PhoneShowcase, type PhoneSlide } from "@/components/home/phone-showcase";
import { getCaseStudies, getProfile, getSettings, localize } from "@/lib/content";

export async function Hero() {
  const locale = await getLocale();
  const t = await getTranslations("Hero");
  const [profile, settings, cases] = await Promise.all([getProfile(), getSettings(), getCaseStudies()]);

  // The phone shows one real screen from each released app that has a hero screen.
  const slides: PhoneSlide[] = cases.flatMap((project) => {
    if (!project.heroImage) return [];
    return [
      {
        slug: project.slug,
        name: project.title,
        src: project.heroImage,
        alt: localize(project.heroImageAlt, locale),
        showLabel: t("phoneShow", { name: project.title }),
        caseLabel: t("phoneCase", { name: project.title }),
      },
    ];
  });

  return (
    <section
      aria-labelledby="hero-title"
      className="mx-auto flex max-w-page flex-wrap items-center gap-14 px-6 pt-20 pb-18 md:pt-24"
    >
      <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-7">
        <p className="m-0 inline-flex items-center gap-2.5 self-start rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-ink-soft">
          <span aria-hidden="true" className="size-2 rounded-full bg-ok" />
          <LocalizedText value={settings.availability} locale={locale} />
        </p>

        <h1
          id="hero-title"
          className="m-0 font-display text-[clamp(44px,6vw,80px)] leading-[0.98] font-extrabold tracking-[-0.035em]"
        >
          <LocalizedText value={profile.heroTitle} locale={locale} />{" "}
          <LocalizedText value={profile.heroAccent} locale={locale} className="text-accent" />
        </h1>

        <LocalizedText
          as="p"
          value={profile.heroDescription}
          locale={locale}
          className="m-0 max-w-[560px] text-[19px] text-body"
        />

        {/* Booking is the main action (blue, like the header's button); the CV is a full button too. */}
        <div className="flex flex-wrap gap-3">
          {settings.calendly && (
            <ExternalLink
              href={settings.calendly}
              className="flex h-13 items-center gap-2.5 rounded-xl bg-accent px-6 font-semibold text-white shadow-[0_12px_24px_-12px_rgba(43,75,242,0.6)] hover:bg-ink"
            >
              <Calendar />
              {t("ctaBook")}
            </ExternalLink>
          )}
          <a
            href="#work"
            className="flex h-13 items-center gap-2.5 rounded-xl bg-ink px-6 font-semibold text-white hover:bg-accent"
          >
            {t("ctaWork")}
            <ArrowForward />
          </a>
          {settings.cvUrl && (
            <a
              href={settings.cvUrl}
              className="flex h-13 items-center gap-2.5 rounded-xl border-2 border-ink bg-surface px-6 font-semibold hover:border-accent hover:text-accent"
            >
              <Download />
              {t("ctaCv")}
            </a>
          )}
        </div>
      </div>

      <PhoneShowcase label={t("phoneLabel")} stages={t("stages")} stores={t("phoneStores")} slides={slides} />
    </section>
  );
}
