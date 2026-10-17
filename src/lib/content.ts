import { createReader } from "@keystatic/core/reader";
import { cacheLife } from "next/cache";
import keystaticConfig from "../../keystatic.config";

// Content is read from content/ at build time and captured in the static pages.
// It changes through a commit (from Keystatic or by hand), which triggers a rebuild.
const reader = createReader(process.cwd(), keystaticConfig);

export type Localized = { en: string; ar: string };

export function localize(value: Localized, locale: string) {
  return locale === "ar" && value.ar ? value.ar : value.en;
}

/** The language a localized value actually renders in, for `lang`/`dir` on fallback text. */
export function renderedLang(value: Localized, locale: string) {
  return locale === "ar" && value.ar ? "ar" : "en";
}

export async function getSettings() {
  "use cache";
  cacheLife("max");
  return reader.singletons.settings.readOrThrow();
}

export async function getProfile() {
  "use cache";
  cacheLife("max");
  return reader.singletons.profile.readOrThrow();
}

export async function getProjects() {
  "use cache";
  cacheLife("max");
  const projects = await reader.collections.projects.all();
  return projects
    .map(({ slug, entry }) => ({ slug, ...entry }))
    .filter((project) => project.visible)
    .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
}

export type Project = Awaited<ReturnType<typeof getProjects>>[number];

export async function getCaseStudies() {
  "use cache";
  cacheLife("max");
  return (await getProjects()).filter((project) => project.caseStudy);
}

export async function getCaseStudy(slug: string) {
  "use cache";
  cacheLife("max");
  return (await getCaseStudies()).find((project) => project.slug === slug) ?? null;
}

export async function getExperience() {
  "use cache";
  cacheLife("max");
  const entries = await reader.collections.experience.all();
  return entries
    .map(({ slug, entry }) => ({ slug, ...entry }))
    .sort((a, b) => (b.start ?? "").localeCompare(a.start ?? ""));
}

export type ExperienceEntry = Awaited<ReturnType<typeof getExperience>>[number];

export async function getTestimonials() {
  "use cache";
  cacheLife("max");
  const entries = await reader.collections.testimonials.all();
  return entries.map(({ slug, entry }) => ({ slug, ...entry }));
}

export async function getPublicSocials() {
  "use cache";
  cacheLife("max");
  const entries = await reader.collections.socials.all();
  return entries
    .map(({ slug, entry }) => ({ slug, ...entry }))
    .filter((social) => social.showPublicly)
    .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
}
