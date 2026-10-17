import { getLocale, getTranslations } from "next-intl/server";
import { ArrowOut } from "@/components/icons";
import { ExternalLink } from "@/components/external-link";
import { Eyebrow, SectionTitle } from "@/components/section-heading";
import { getPublicSocials, getSettings } from "@/lib/content";
import { siteUrl } from "@/lib/site";
import { ContactForm } from "./contact-form";
import { CopyEmail } from "./copy-email";

export async function Contact() {
  const locale = await getLocale();
  const t = await getTranslations("Contact");
  const [settings, socials] = await Promise.all([getSettings(), getPublicSocials()]);

  const linkClass =
    "inline-flex items-center gap-1.5 py-2.5 font-semibold underline underline-offset-4 hover:text-accent";

  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="mx-auto max-w-page scroll-mt-24 px-6 pb-28"
    >
      <div className="flex flex-wrap gap-14 rounded-[28px] border border-line bg-surface p-[clamp(28px,5vw,64px)]">
        <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-5">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <SectionTitle id="contact-title">{t("title")}</SectionTitle>
          <p className="m-0 text-body">{t("body")}</p>
          <ul className="m-0 flex list-none flex-col p-0">
            <li className="flex flex-wrap items-center gap-3">
              <a href={`mailto:${settings.email}`} className={linkClass} dir="ltr">
                {settings.email}
              </a>
              <CopyEmail email={settings.email} />
            </li>
            {settings.whatsapp && (
              <li>
                <ExternalLink href={settings.whatsapp} className={linkClass}>
                  {t("whatsapp")}
                  <ArrowOut />
                </ExternalLink>
              </li>
            )}
            {socials.map((social) => (
              <li key={social.slug}>
                <ExternalLink href={social.url} className={linkClass}>
                  {social.platform}
                  <ArrowOut />
                </ExternalLink>
              </li>
            ))}
          </ul>
        </div>

        <ContactForm
          action={`https://formsubmit.co/${settings.email}`}
          nextUrl={`${siteUrl}/${locale}/thank-you`}
        />
      </div>
    </section>
  );
}
