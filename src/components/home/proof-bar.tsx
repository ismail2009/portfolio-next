import { getLocale, getTranslations } from "next-intl/server";
import { LocalizedText } from "@/components/localized-text";
import { getProfile } from "@/lib/content";

export async function ProofBar() {
  const locale = await getLocale();
  const t = await getTranslations("Proof");
  const profile = await getProfile();

  return (
    <section aria-label={t("label")} className="mx-auto max-w-page px-6 pb-24">
      <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] border-y border-line">
        {profile.metrics.map((metric) => (
          <div key={metric.value} className="flex flex-col-reverse gap-1 py-7 pe-6">
            <LocalizedText as="dt" value={metric.label} locale={locale} className="text-[15px] text-muted" />
            <dd className="m-0 font-display text-[44px] leading-none font-semibold tracking-[-0.03em]">
              <bdi>{metric.value}</bdi>
            </dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap items-center gap-x-9 gap-y-3 pt-7">
        <p className="m-0 font-mono text-[13px] tracking-[0.08em] text-muted uppercase">{t("shippedFor")}</p>
        <ul className="m-0 flex list-none flex-wrap gap-x-9 gap-y-3 p-0">
          {profile.clients.map((client) => (
            <li
              key={client}
              lang="en"
              className="font-display text-xl font-semibold tracking-[-0.01em] text-[#3a3e46]"
            >
              {client}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
