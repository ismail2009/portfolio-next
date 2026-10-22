import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getProfile, getSettings } from "@/lib/content";
import { ExternalLink } from "./external-link";
import { LanguageSwitch } from "./language-switch";
import { MobileMenu } from "./mobile-menu";

const sections = ["work", "experience", "services", "about", "contact"] as const;

export async function SiteHeader() {
  const t = await getTranslations("Nav");
  const [settings, profile] = await Promise.all([getSettings(), getProfile()]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ground/90 backdrop-blur-md">
      <nav
        aria-label={t("label")}
        className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-x-4 gap-y-1 px-6 py-3"
      >
        <Link href="/" aria-label={t("home")} className="flex items-center gap-2.5 no-underline">
          {/* The link is already labelled, so the photo is decorative. */}
          {profile.photo ? (
            <Image
              src={profile.photo}
              alt=""
              width={36}
              height={36}
              loading="eager"
              className="size-9 rounded-full border border-line bg-sunken object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-[9px] bg-ink font-mono text-sm font-medium text-ground"
            >
              IA
            </span>
          )}
          <span className="font-display text-lg font-semibold tracking-[-0.01em]">{t("brand")}</span>
        </Link>

        {/* On phones these links move into the slide-in menu (MobileMenu). */}
        <ul className="hidden gap-6 text-[15px] font-medium md:flex">
          {sections.map((section) => (
            <li key={section}>
              <Link
                href={{ pathname: "/", hash: section }}
                className="block py-2.5 whitespace-nowrap no-underline hover:text-accent"
              >
                {t(section)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2.5">
          <LanguageSwitch />
          {settings.calendly && (
            <ExternalLink
              href={settings.calendly}
              className="hidden h-11 items-center rounded-[10px] bg-accent px-4 text-[15px] font-semibold text-white no-underline hover:bg-ink sm:flex"
            >
              {t("book")}
            </ExternalLink>
          )}
          <MobileMenu sections={sections} bookUrl={settings.calendly ?? undefined} />
        </div>
      </nav>
    </header>
  );
}
