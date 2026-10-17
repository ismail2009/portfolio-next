import { getLocale, getTranslations } from "next-intl/server";
import { ArrowForward } from "@/components/icons";
import { ExternalLink } from "@/components/external-link";
import { LocalizedText } from "@/components/localized-text";
import { getProfile, getSettings } from "@/lib/content";

export async function Hero() {
  const locale = await getLocale();
  const t = await getTranslations("Hero");
  const [profile, settings] = await Promise.all([getProfile(), getSettings()]);

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
          className="m-0 font-display text-[clamp(44px,6vw,80px)] leading-[0.98] font-extrabold tracking-[-0.035em] rtl:leading-[1.15]"
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

        <div className="flex flex-wrap gap-3">
          <a
            href="#work"
            className="flex h-13 items-center gap-2.5 rounded-xl bg-ink px-6 font-semibold text-white hover:bg-accent"
          >
            {t("ctaWork")}
            <ArrowForward />
          </a>
          {settings.calendly && (
            <ExternalLink
              href={settings.calendly}
              className="flex h-13 items-center rounded-xl border border-line-strong bg-surface px-6 font-semibold hover:border-ink"
            >
              {t("ctaBook")}
            </ExternalLink>
          )}
          {settings.cvUrl && (
            <a
              href={settings.cvUrl}
              className="flex h-13 items-center px-2 font-semibold underline underline-offset-4 hover:text-accent"
            >
              {t("ctaCv")}
            </a>
          )}
        </div>
      </div>

      <ShipLog
        title={t("logTitle")}
        label={t("logLabel")}
        rows={profile.shipLog}
        summary={profile.shipLogSummary}
        locale={locale}
      />
    </section>
  );
}

type ShipLogProps = {
  title: string;
  label: string;
  rows: Awaited<ReturnType<typeof getProfile>>["shipLog"];
  summary: Awaited<ReturnType<typeof getProfile>>["shipLogSummary"];
  locale: string;
};

/** The terminal card is code-flavoured, so it always reads left to right. */
function ShipLog({ title, label, rows, summary, locale }: ShipLogProps) {
  return (
    <figure
      aria-label={label}
      className="m-0 min-w-0 flex-[1_1_380px] rounded-[20px] bg-ink p-2 text-night-text shadow-[0_30px_60px_-30px_rgba(17,19,24,0.45)]"
    >
      <figcaption
        className="flex items-center justify-between px-4 py-3 font-mono text-[13px] text-night-muted"
        dir="ltr"
      >
        <span>{title}</span>
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#3a3f48]" />
          <span className="size-2.5 rounded-full bg-[#3a3f48]" />
          <span className="size-2.5 rounded-full bg-[#3a3f48]" />
        </span>
      </figcaption>
      <ol className="m-0 flex list-none flex-col gap-4 rounded-[14px] bg-night-raised p-5 font-mono text-[13.5px] leading-[1.55]">
        {rows.map((row) => (
          <li key={`${row.when}-${row.what.en}`} className="grid grid-cols-[76px_minmax(0,1fr)] gap-3">
            <span className="text-accent-night" dir="ltr">
              {row.when}
            </span>
            <span>
              <LocalizedText value={row.what} locale={locale} className="block font-medium text-white" />
              <LocalizedText value={row.detail} locale={locale} className="block text-night-muted" />
            </span>
          </li>
        ))}
        <li className="border-t border-[#2a2e36] pt-3.5 text-night-muted">
          <span aria-hidden="true">$ </span>
          <LocalizedText value={summary} locale={locale} className="text-[#6ee7a8]" />
        </li>
      </ol>
    </figure>
  );
}
