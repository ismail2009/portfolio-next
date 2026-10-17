import { getTranslations } from "next-intl/server";
import { Check } from "@/components/icons";
import { ExternalLink } from "@/components/external-link";
import { Eyebrow, SectionTitle } from "@/components/section-heading";
import { getSettings } from "@/lib/content";

export async function Services() {
  const t = await getTranslations("Services");
  const settings = await getSettings();

  return (
    <section
      id="services"
      aria-labelledby="services-title"
      className="mx-auto max-w-page scroll-mt-24 px-6 py-28"
    >
      <div className="mb-12 flex max-w-[680px] flex-col gap-3">
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <SectionTitle id="services-title">{t("title")}</SectionTitle>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-6">
        <article className="flex flex-col gap-5 rounded-card border border-line bg-surface p-8 md:p-10">
          <p className="m-0 font-mono text-[13px] text-muted">{t("role.audience")}</p>
          <h3 className="m-0 font-display text-[32px] font-extrabold tracking-[-0.025em]">
            {t("role.title")}
          </h3>
          <p className="m-0 text-ink-soft">{t("role.body")}</p>
          <Points items={[t("role.point1"), t("role.point2"), t("role.point3")]} className="text-body" />
          <a
            href="#contact"
            className="mt-auto flex h-12 items-center self-start rounded-xl bg-ink px-5 text-[15px] font-semibold text-white hover:bg-accent"
          >
            {t("role.cta")}
          </a>
        </article>

        <article className="flex flex-col gap-5 rounded-card bg-ink p-8 text-night-text md:p-10">
          <p className="m-0 font-mono text-[13px] text-night-muted">{t("build.audience")}</p>
          <h3 className="m-0 font-display text-[32px] font-extrabold tracking-[-0.025em] text-white">
            {t("build.title")}
          </h3>
          <p className="m-0 text-[#d3d5d9]">{t("build.body")}</p>
          <Points
            items={[t("build.point1"), t("build.point2"), t("build.point3")]}
            className="text-[#c9ccd2]"
            checkClassName="text-accent-night"
          />
          {settings.calendly && (
            <ExternalLink
              href={settings.calendly}
              className="mt-auto flex h-12 items-center self-start rounded-xl bg-accent px-5 text-[15px] font-semibold text-white hover:bg-white hover:text-ink"
            >
              {t("build.cta")}
            </ExternalLink>
          )}
        </article>
      </div>
    </section>
  );
}

function Points({
  items,
  className,
  checkClassName = "text-accent",
}: {
  items: string[];
  className: string;
  checkClassName?: string;
}) {
  return (
    <ul className={`m-0 flex list-none flex-col gap-2.5 p-0 text-[15.5px] ${className}`}>
      {items.map((item) => (
        <li key={item} className="flex gap-2.5">
          <span className={`pt-1 ${checkClassName}`}>
            <Check />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}
