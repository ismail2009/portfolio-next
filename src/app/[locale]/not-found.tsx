import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowForward } from "@/components/icons";
import { Eyebrow } from "@/components/section-heading";

// Nested not-found files can't export metadata; Next adds noindex to 404 responses itself.
export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <section className="mx-auto flex min-h-[60vh] max-w-page flex-col justify-center gap-6 px-6 py-24">
      <Eyebrow>{t("eyebrow")}</Eyebrow>
      <h1 className="m-0 max-w-3xl font-display text-[clamp(40px,5.4vw,68px)] leading-[1.04] font-extrabold tracking-[-0.035em]">
        {t("title")}
      </h1>
      <p className="m-0 max-w-[560px] text-[19px] text-body">{t("body")}</p>
      <Link
        href={{ pathname: "/", hash: "work" }}
        className="flex h-13 items-center gap-2.5 self-start rounded-xl bg-ink px-6 font-semibold text-white hover:bg-accent"
      >
        {t("home")}
        <ArrowForward />
      </Link>
    </section>
  );
}
