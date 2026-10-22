import { readFile } from "node:fs/promises";
import path from "node:path";
import { createReader } from "@keystatic/core/reader";
import { imageSize } from "image-size";
import { cacheLife } from "next/cache";
import keystaticConfig from "../../keystatic.config";

// Content is read from content/ at build time and captured in the static pages.
// It changes through a commit (from Keystatic or by hand), which triggers a rebuild.
const reader = createReader(process.cwd(), keystaticConfig);

export type Localized = { en: string; ar: string };

export function localize(value: Localized, locale: string) {
  return locale === "ar" && value.ar ? value.ar : value.en;
}

/**
 * In Arabic, "و", "الـ", "بـ" and "لـ" are written apart from a following Latin word
 * ("React و React Native", "بـ Next.js"), so a line can break right after them and leave
 * them alone at the line end. A no-break space keeps them with the next word; the same
 * goes for "+" in "iOS + Android".
 */
const NO_BREAK_SPACE = String.fromCharCode(0xa0);

export function arabicSpacing(text: string) {
  return text
    .replace(/(^|\s)(و|الـ|بـ|لـ) (?=[A-Za-z0-9])/g, `$1$2${NO_BREAK_SPACE}`)
    .replace(/ \+ /g, `${NO_BREAK_SPACE}+${NO_BREAK_SPACE}`);
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
  const visible = projects
    .map(({ slug, entry }) => ({ slug, ...entry }))
    .filter((project) => project.visible)
    .sort((a, b) => (a.order ?? 100) - (b.order ?? 100));
  return Promise.all(
    visible.map(async (project) => ({
      ...project,
      screenshots: await Promise.all(project.screenshots.map(withSize)),
    })),
  );
}

// Screens differ in shape between apps, so each one's size is read from the file at build time
// to let next/image reserve the right space.
async function withSize<T extends { image: string | null }>(screen: T) {
  const src = screen.image ?? "";
  const { width, height } = imageSize(await readFile(path.join(process.cwd(), "public", src)));
  return { ...screen, image: src, width, height };
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
  const sorted = entries
    .map(({ slug, entry }) => ({ slug, ...entry }))
    .sort((a, b) => (b.start ?? "").localeCompare(a.start ?? ""));
  // Logos are wordmarks of different widths, so their size is read here for next/image.
  return Promise.all(
    sorted.map(async (entry) => {
      if (!entry.logo) return { ...entry, logo: null };
      const { width, height } = imageSize(await readFile(path.join(process.cwd(), "public", entry.logo)));
      return { ...entry, logo: { src: entry.logo, width, height } };
    }),
  );
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
