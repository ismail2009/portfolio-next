import { cacheLife } from "next/cache";
import { getTranslations } from "next-intl/server";
import { getPublicSocials, getSettings } from "@/lib/content";
import { ExternalLink } from "./external-link";

async function buildYear() {
  "use cache";
  cacheLife("max");
  return new Date().getFullYear();
}

export async function SiteFooter() {
  const t = await getTranslations("Footer");
  const [settings, socials, year] = await Promise.all([getSettings(), getPublicSocials(), buildYear()]);

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-page flex-wrap items-center justify-between gap-4 px-6 py-8 text-[15px] text-muted">
        <p className="m-0">{t("rights", { year })}</p>
        <ul className="m-0 flex list-none flex-wrap gap-5 p-0">
          {socials.map((social) => (
            <li key={social.slug}>
              <ExternalLink href={social.url} className="block py-2.5 hover:text-accent">
                {social.platform}
              </ExternalLink>
            </li>
          ))}
          <li>
            <a href={`mailto:${settings.email}`} className="block py-2.5 hover:text-accent">
              Email
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
