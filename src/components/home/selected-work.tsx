import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowForward, ArrowOut } from "@/components/icons";
import { ExternalLink } from "@/components/external-link";
import { LocalizedText } from "@/components/localized-text";
import { ProjectMeta, ScreenFan, Stack, StoreLinks } from "@/components/project-parts";
import { Eyebrow, SectionTitle } from "@/components/section-heading";
import { getProjects, localize, type Project } from "@/lib/content";

export async function SelectedWork() {
  const locale = await getLocale();
  const t = await getTranslations("Work");
  const common = await getTranslations("Common");
  const projects = await getProjects();

  const cases = projects.filter((project) => project.caseStudy);
  const featured = cases.find((project) => project.featured) ?? cases[0];
  const others = cases.filter((project) => project !== featured);
  const alsoShipped = projects.filter((project) => !project.caseStudy);

  return (
    <section id="work" aria-labelledby="work-title" className="mx-auto max-w-page scroll-mt-24 px-6 pb-28">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div className="flex max-w-[640px] flex-col gap-3">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <SectionTitle id="work-title">{t("title")}</SectionTitle>
        </div>
        <p className="m-0 max-w-[380px] text-muted">{t("lead")}</p>
      </div>

      {featured && <FeaturedCase project={featured} locale={locale} readCase={common("readCase")} />}

      <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-6">
        {others.map((project) => (
          <CaseCard key={project.slug} project={project} locale={locale} readCase={common("readCase")} />
        ))}
      </div>

      {alsoShipped.length > 0 && (
        <div className="mt-10 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-line pt-6">
          <p className="m-0 font-mono text-[13px] tracking-[0.08em] text-muted uppercase rtl:font-sans">
            {t("alsoShipped")}
          </p>
          <ul className="m-0 flex list-none flex-wrap gap-x-6 gap-y-2 p-0">
            {alsoShipped.map((project) => {
              const link = project.links[0];
              return (
                <li key={project.slug}>
                  {link ? (
                    <ExternalLink
                      href={link.href}
                      className="inline-flex items-center gap-1.5 py-2 font-semibold underline-offset-4 hover:text-accent hover:underline"
                    >
                      <span lang="en">{project.title}</span>
                      <span className="font-normal text-muted">· {localize(link.label, locale)}</span>
                      <ArrowOut />
                    </ExternalLink>
                  ) : (
                    <span lang="en">{project.title}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

// The whole card opens the case: the "Read the case" link stretches over it with ::after, so it
// stays one real link for keyboards and screen readers. Store links sit above it and keep their own targets.
const cardClass =
  "group relative isolate overflow-hidden rounded-card border border-line bg-surface transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-[0_24px_48px_-32px_rgba(17,19,24,0.35)] has-[a:focus-visible]:border-accent";
const stretchedLink = "after:absolute after:inset-0 after:content-['']";

function FeaturedCase({ project, locale, readCase }: { project: Project; locale: string; readCase: string }) {
  return (
    <article className={`flex flex-wrap ${cardClass}`}>
      <div className="relative flex min-h-80 min-w-0 flex-[999_1_520px] items-center justify-center bg-sunken p-10 md:min-h-105">
        <ScreenFan project={project} locale={locale} variant="featured" priority />
      </div>
      <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-5 p-8 md:p-10">
        <ProjectMeta project={project} locale={locale} />
        <h3 lang="en" className="m-0 font-display text-4xl leading-[1.05] font-extrabold tracking-[-0.03em]">
          {project.title}
        </h3>
        <LocalizedText as="p" value={project.outcome} locale={locale} className="m-0 text-lg text-ink-soft" />
        {project.decisions.length > 0 && (
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[15px] text-body">
            {project.decisions.slice(0, 3).map((decision) => (
              <li key={decision.en} className="flex gap-2.5">
                <span aria-hidden="true" className="pt-1 text-accent">
                  <ArrowForward size={14} />
                </span>
                <LocalizedText value={decision} locale={locale} />
              </li>
            ))}
          </ul>
        )}
        <Stack items={project.stack} />
        <div className="mt-auto flex flex-wrap gap-3 pt-2">
          <Link
            href={`/work/${project.slug}`}
            className={`flex h-12 items-center rounded-xl bg-ink px-5 text-[15px] font-semibold text-white group-hover:bg-accent ${stretchedLink}`}
          >
            {readCase}
            <span className="sr-only">: {project.title}</span>
          </Link>
          <div className="relative z-10 flex flex-wrap gap-3">
            <StoreLinks project={project} locale={locale} />
          </div>
        </div>
      </div>
    </article>
  );
}

function CaseCard({ project, locale, readCase }: { project: Project; locale: string; readCase: string }) {
  return (
    <article className={`flex flex-col ${cardClass}`}>
      <div className="relative flex h-64 items-center justify-center bg-sunken">
        <ScreenFan project={project} locale={locale} variant="card" />
      </div>
      <div className="flex grow flex-col gap-3.5 p-8">
        <ProjectMeta project={project} locale={locale} />
        <h3 lang="en" className="m-0 font-display text-[28px] font-extrabold tracking-[-0.025em]">
          {project.title}
        </h3>
        <LocalizedText as="p" value={project.outcome} locale={locale} className="m-0 text-ink-soft" />
        <p className="m-0 font-mono text-[12.5px] text-muted">
          <bdi>{project.stack.join(" · ")}</bdi>
        </p>
        <div className="mt-auto flex flex-wrap gap-x-2 pt-2">
          <Link
            href={`/work/${project.slug}`}
            className={`inline-flex h-12 items-center px-2 text-[15px] font-semibold underline underline-offset-4 group-hover:text-accent ${stretchedLink}`}
          >
            {readCase}
            <span className="sr-only">: {project.title}</span>
          </Link>
          <div className="relative z-10 flex flex-wrap gap-x-2">
            <StoreLinks project={project} locale={locale} />
          </div>
        </div>
      </div>
    </article>
  );
}
