import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowOut } from "@/components/icons";
import { ExternalLink } from "@/components/external-link";
import { LocalizedText } from "@/components/localized-text";
import { Eyebrow } from "@/components/section-heading";
import { getProfile, getTestimonials } from "@/lib/content";

export async function About() {
  const locale = await getLocale();
  const t = await getTranslations("About");
  const [profile, testimonials] = await Promise.all([getProfile(), getTestimonials()]);
  const testimonial = testimonials[0];

  return (
    <section id="about" aria-labelledby="about-title" className="scroll-mt-16 border-t border-line">
      <div className="mx-auto flex max-w-page flex-wrap gap-14 px-6 py-28">
        <div className="flex min-w-0 flex-[999_1_520px] flex-col gap-5">
          {profile.photo && (
            <Image
              src={profile.photo}
              alt={t("photoAlt")}
              width={112}
              height={112}
              className="size-28 rounded-full border border-line bg-sunken object-cover"
            />
          )}
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <LocalizedText
            as="h2"
            id="about-title"
            value={profile.aboutTitle}
            locale={locale}
            className="m-0 font-display text-[clamp(30px,3.4vw,44px)] leading-[1.1] font-extrabold tracking-[-0.03em]"
          />
          <LocalizedText as="p" value={profile.aboutBody} locale={locale} className="m-0 text-ink-soft" />

          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {profile.tools.map((tool) => (
              <li
                key={tool}
                className="rounded-lg border border-line bg-surface px-3 py-1.5 font-mono text-[13px]"
              >
                <bdi>{tool}</bdi>
              </li>
            ))}
          </ul>

          <div className="mt-2 border-t border-line pt-5 text-[15px]">
            <p className="m-0 font-mono text-[12.5px] tracking-[0.06em] text-muted uppercase">
              {t("education")}
            </p>
            <p className="m-0 mt-1.5">
              <LocalizedText value={profile.education.degree} locale={locale} className="font-semibold" />
              {" · "}
              <LocalizedText value={profile.education.school} locale={locale} className="text-body" />
              {profile.education.graduation && (
                <span className="text-muted">
                  {" "}
                  · {t("graduation", { year: profile.education.graduation })}
                </span>
              )}
            </p>
          </div>
        </div>

        {testimonial && (
          <figure className="m-0 flex min-w-0 flex-[1_1_360px] flex-col gap-6 rounded-card border border-line bg-surface p-8 md:p-10">
            <svg
              aria-hidden="true"
              width="36"
              height="28"
              viewBox="0 0 36 28"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="text-accent rtl:-scale-x-100"
            >
              <path d="M14 4C7 6 3 11 3 18v6h10v-9H7" />
              <path d="M33 4c-7 2-11 7-11 14v6h10v-9h-6" />
            </svg>
            <LocalizedText
              as="blockquote"
              value={testimonial.quote}
              locale={locale}
              className="m-0 font-display text-2xl leading-[1.35] font-medium tracking-[-0.015em]"
            />
            <figcaption className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
              <span>
                <strong className="block" lang="en">
                  {testimonial.name}
                </strong>
                <LocalizedText value={testimonial.role} locale={locale} className="text-[15px] text-muted" />
              </span>
              {testimonial.link && (
                <ExternalLink
                  href={testimonial.link}
                  className="inline-flex items-center gap-1.5 py-2.5 text-[15px] font-semibold underline underline-offset-4 hover:text-accent"
                >
                  {t("testimonialLink")}
                  <ArrowOut />
                </ExternalLink>
              )}
            </figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}
