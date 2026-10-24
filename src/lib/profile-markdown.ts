import { getTranslations } from "next-intl/server";
import { cacheLife } from "next/cache";
import {
  getExperience,
  getProfile,
  getProjects,
  getPublicSocials,
  getSettings,
  getTestimonials,
  localize,
  type Localized,
} from "@/lib/content";
import { siteUrl } from "@/lib/site";

/**
 * The whole public profile as one Markdown file, for AI assistants filling in job applications
 * or answering a recruiter's questions. It reads the same content as the site, so it never drifts.
 * Only what the site already shows publicly goes in: hidden projects and socials stay out.
 */
export async function profileMarkdown(locale: string) {
  "use cache";
  cacheLife("max");

  const [t, profile, settings, socials, experience, projects, testimonials] = await Promise.all([
    getTranslations({ locale, namespace: "ProfileMd" }),
    getProfile(),
    getSettings(),
    getPublicSocials(),
    getExperience(),
    getProjects(),
    getTestimonials(),
  ]);
  const tExperience = await getTranslations({ locale, namespace: "Experience" });

  const l = (value: Localized) => localize(value, locale).trim();
  // Same month format as the Experience section on the site.
  const dates = new Intl.DateTimeFormat(locale === "ar" ? "ar-PS" : locale, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
    numberingSystem: "latn",
  });
  const month = (date: string) => dates.format(new Date(`${date}T00:00:00Z`));
  const home = `${siteUrl}/${locale}`;

  const lines: string[] = [];
  const add = (...items: (string | false | null | undefined)[]) =>
    lines.push(...items.filter((item): item is string => typeof item === "string"));
  // "- **Label:** value", skipped when the value is empty.
  const field = (label: string, value?: string | null) => (value ? `- **${label}:** ${value}` : null);

  add(`# ${t("name")}`, "", `> ${t("intro", { url: home })}`, "");
  add(`${l(profile.heroTitle)} ${l(profile.heroAccent)}`, "", l(profile.heroDescription), "");

  add(`## ${t("contact")}`, "");
  add(
    field(t("email"), settings.email),
    field(t("whatsapp"), settings.whatsapp),
    field(t("call"), settings.calendly),
    field(t("cv"), settings.cvUrl),
    field(t("website"), home),
    ...socials.map((social) => field(social.platform, social.url)),
    field(t("availability"), l(settings.availability)),
    "",
  );

  add(`## ${t("summary")}`, "", `### ${l(profile.aboutTitle)}`, "", l(profile.aboutBody), "");
  add(`### ${t("highlights")}`, "");
  add(...profile.metrics.map((metric) => `- ${metric.value} — ${l(metric.label)}`), "");

  add(`## ${t("experience")}`, "");
  for (const entry of experience) {
    const company = locale === "ar" && entry.companyAr ? entry.companyAr : entry.company;
    const end = entry.end ? month(entry.end) : tExperience("present");
    add(`### ${l(entry.role)} — ${company}`, "");
    add(
      entry.start && `${month(entry.start)} – ${end}${l(entry.type) ? ` · ${l(entry.type)}` : ""}`,
      "",
      l(entry.outcome),
      "",
      field(t("stack"), entry.tags.join(", ")),
      field(t("caseStudy"), entry.caseStudy && `${home}/work/${entry.caseStudy}`),
      "",
    );
  }

  add(`## ${t("projects")}`, "");
  for (const project of projects) {
    add(`### ${project.title}${l(project.category) ? ` — ${l(project.category)}` : ""}`, "");
    add(l(project.outcome), "");
    add(
      field(t("client"), project.client),
      field(t("year"), project.year),
      field(t("role"), l(project.role)),
      field(t("period"), l(project.engagement)),
      field(t("result"), l(project.metric)),
      field(t("stack"), project.stack.join(", ")),
      field(t("caseStudy"), project.caseStudy ? `${home}/work/${project.slug}` : null),
      ...project.links.map((link) => field(l(link.label), link.href)),
    );
    if (l(project.problem)) add("", `**${t("problem")}:** ${l(project.problem)}`);
    if (project.decisions.length) {
      add("", `**${t("decisions")}:**`, ...project.decisions.map((item) => `- ${l(item)}`));
    }
    if (project.shipped.length) {
      add("", `**${t("shipped")}:**`, ...project.shipped.map((item) => `- ${l(item)}`));
    }
    add("");
  }

  add(`## ${t("skills")}`, "");
  add(...profile.skillGroups.map((group) => field(group.category, group.tags.join(", "))), "");

  add(`## ${t("education")}`, "");
  add(
    `- ${l(profile.education.degree)} — ${l(profile.education.school)}`,
    field(t("graduated"), profile.education.graduation),
    "",
  );

  add(`## ${t("training")}`, "");
  add(
    ...profile.training.map((item) =>
      [`- ${l(item.title)} — ${l(item.organization)}`, l(item.dates)].filter(Boolean).join(" · "),
    ),
    "",
  );

  if (testimonials.length) {
    add(`## ${t("recommendations")}`, "");
    for (const item of testimonials) {
      add(`> ${l(item.quote)}`, ">", `> — ${item.name}, ${l(item.role)}`, "");
    }
  }

  return lines.join("\n");
}
