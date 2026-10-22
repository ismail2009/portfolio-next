import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { LocalizedText } from "@/components/localized-text";
import { getExperience, getProfile } from "@/lib/content";

export async function ProofBar() {
  const locale = await getLocale();
  const t = await getTranslations("Proof");
  const [profile, experience] = await Promise.all([getProfile(), getExperience()]);

  // Each client shows the logo from its experience entry ("Casting Arabia" matches "Casting Arabia LLC");
  // clients without a logo of their own are left out rather than shown as plain text.
  const same = (a: string, b: string) => a.toLowerCase().startsWith(b.toLowerCase());
  const logos = profile.clients.flatMap((client) => {
    const logo = experience.find((entry) => same(entry.company, client) || same(client, entry.company))?.logo;
    return logo ? [{ client, logo }] : [];
  });

  return (
    <section aria-label={t("label")} className="mx-auto max-w-page px-6 pb-24">
      <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] border-y border-line">
        {profile.metrics.map((metric) => (
          <div key={metric.value} className="flex flex-col-reverse gap-1 py-7 pe-6">
            <LocalizedText as="dt" value={metric.label} locale={locale} className="text-[15px] text-muted" />
            <dd className="m-0 font-display text-[44px] leading-none font-semibold tracking-[-0.03em]">
              {/* Arabic writes "more than 7" as +7, with the plus first. */}
              <bdi>{locale === "ar" ? metric.value.replace(/^(\d+)\+$/, "+$1") : metric.value}</bdi>
            </dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap items-center gap-x-9 gap-y-3 pt-7">
        <p className="m-0 font-mono text-[13px] tracking-[0.08em] text-muted uppercase rtl:font-sans">
          {t("shippedFor")}
        </p>
        <ul className="m-0 flex list-none flex-wrap items-center gap-x-10 gap-y-4 p-0">
          {logos.map(({ client, logo }) => (
            <li key={client} className="flex items-center">
              <Image
                src={logo.src}
                alt={client}
                width={logo.width}
                height={logo.height}
                sizes="160px"
                // Square app-style logos and stacked (multi-line) logos sit taller than one-line wordmarks,
                // so they all read at about the same weight.
                className={
                  logo.width < logo.height * 1.5
                    ? "size-11 rounded-[10px]"
                    : logo.width < logo.height * 2.5
                      ? "h-11 w-auto"
                      : "h-8 w-auto max-w-40"
                }
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
