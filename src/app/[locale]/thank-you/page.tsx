import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Check } from "@/components/icons";
import { ExternalLink } from "@/components/external-link";
import { Eyebrow } from "@/components/section-heading";
import { getSettings } from "@/lib/content";

export async function generateMetadata({ params }: PageProps<"/[locale]/thank-you">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ThankYou" });
  return { title: t("metaTitle"), robots: { index: false } };
}

// The contact form service redirects here after a successful send.
export default async function ThankYouPage({ params }: PageProps<"/[locale]/thank-you">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ThankYou" });
  const settings = await getSettings();

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-page flex-col justify-center gap-6 px-6 py-24">
      <span
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-full bg-ok/10 text-ok"
      >
        <Check size={28} />
      </span>
      <Eyebrow>{t("eyebrow")}</Eyebrow>
      <h1 className="m-0 max-w-3xl font-display text-[clamp(40px,5.4vw,68px)] leading-[1.04] font-extrabold tracking-[-0.035em]">
        {t("title")}
      </h1>
      <p className="m-0 max-w-[560px] text-[19px] text-body">{t("body")}</p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/"
          className="flex h-13 items-center rounded-xl bg-ink px-6 font-semibold text-white hover:bg-accent"
        >
          {t("home")}
        </Link>
        {settings.calendly && (
          <ExternalLink
            href={settings.calendly}
            className="flex h-13 items-center rounded-xl border border-line-strong bg-surface px-6 font-semibold hover:border-ink"
          >
            {t("book")}
          </ExternalLink>
        )}
      </div>
    </section>
  );
}
