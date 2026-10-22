// One-time import from the old portfolio (Firestore + case-studies.js + images) into content/.
//
//   npm run import:firestore -- [--old ../ismail.al-saleh] [--force]
//
// Reads Firestore through its public REST API with the web config from the old site, so it only
// sees what the old public site could already read. Existing content files are skipped unless
// --force is passed, so edits made in Keystatic are never overwritten by accident.

import { copyFile, mkdir, readFile, writeFile, access } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import * as yaml from "js-yaml";

const args = process.argv.slice(2);
const force = args.includes("--force");
const oldIndex = args.indexOf("--old");
const oldSite = resolve(oldIndex >= 0 ? args[oldIndex + 1] : "../ismail.al-saleh");
const root = process.cwd();

const exists = (path) =>
  access(path).then(
    () => true,
    () => false,
  );
const slugify = (text) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const en = (value) => (value ? { en: value } : { en: "" });

const written = [];
const skipped = [];

async function writeYaml(relativePath, data) {
  const path = join(root, relativePath);
  if (!force && (await exists(path))) {
    skipped.push(relativePath);
    return;
  }
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, yaml.dump(data, { lineWidth: -1, noRefs: true }));
  written.push(relativePath);
}

async function copyAsset(oldRelative, publicDir, slug, name) {
  if (!oldRelative) return undefined;
  const source = join(oldSite, oldRelative);
  if (!(await exists(source))) {
    console.warn(`  ! missing image ${oldRelative}`);
    return undefined;
  }
  const file = `${name}${extname(source).toLowerCase()}`;
  const target = join(root, "public", publicDir, slug, file);
  if (force || !(await exists(target))) {
    await mkdir(dirname(target), { recursive: true });
    await copyFile(source, target);
  }
  return `/${publicDir}/${slug}/${file}`;
}

// ---- Firestore ---------------------------------------------------------------------------

async function firestoreConfig() {
  const source = await readFile(join(oldSite, "assets/js/firebase-config.js"), "utf8");
  const pick = (key) => source.match(new RegExp(`${key}:\\s*"([^"]+)"`))?.[1];
  const config = { apiKey: pick("apiKey"), projectId: pick("projectId") };
  if (!config.apiKey || !config.projectId)
    throw new Error("Could not read apiKey/projectId from firebase-config.js");
  return config;
}

const decode = (value) => {
  const [type, inner] = Object.entries(value)[0];
  if (type === "arrayValue") return (inner.values ?? []).map(decode);
  if (type === "mapValue") return decodeFields(inner.fields);
  if (type === "integerValue") return Number(inner);
  return inner;
};
const decodeFields = (fields = {}) =>
  Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, decode(v)]));

async function fetchCollection({ apiKey, projectId }, path) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}?pageSize=300&key=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Firestore ${path}: ${response.status} ${await response.text()}`);
  const body = await response.json();
  if (body.documents)
    return body.documents.map((d) => ({ id: d.name.split("/").pop(), ...decodeFields(d.fields) }));
  return [{ id: path.split("/").pop(), ...decodeFields(body.fields) }];
}

// ---- Mapping -----------------------------------------------------------------------------

const categoryAr = { Websites: "مواقع ويب", "React Native Mobile Apps": "تطبيقات React Native" };

function storeLink(href) {
  const host = new URL(href).hostname;
  if (host.includes("apple.com")) return { label: { en: "App Store", ar: "App Store" }, href };
  if (host.includes("play.google.com")) return { label: { en: "Google Play", ar: "Google Play" }, href };
  return { label: { en: "Live website", ar: "الموقع" }, href };
}

const caseOrder = ["casting-arabia", "ruh", "plutoo"];

async function importProjects(config, caseStudies) {
  const docs = await fetchCollection(config, "projects");
  const others = docs
    .map((doc) => ({ doc, slug: slugify(doc.title) }))
    .sort((a, b) => String(b.doc.createdAt).localeCompare(String(a.doc.createdAt)));

  for (const [index, { doc, slug }] of others.entries()) {
    const study = caseStudies.find((s) => s.slug === slug);
    const image = await copyAsset(study?.image ?? doc.image, "images/projects", slug, "image");
    const caseIndex = caseOrder.indexOf(slug);

    await writeYaml(`content/projects/${slug}.yaml`, {
      title: doc.title,
      visible: doc.isVisible !== false,
      featured: slug === "casting-arabia",
      caseStudy: Boolean(study),
      order: caseIndex >= 0 ? caseIndex + 1 : 10 + index,
      category: study
        ? en(study.category)
        : { en: doc.category, ...(categoryAr[doc.category] && { ar: categoryAr[doc.category] }) },
      year: study?.year ?? String(doc.createdAt ?? "").slice(0, 4),
      client: study?.client ?? "",
      role: en(study?.role),
      engagement: en(study?.engagement),
      outcome: en(study?.outcome ?? doc.result),
      problem: en(study?.problem ?? doc.challenge),
      decisions: (study?.decisions ?? []).map(en),
      shipped: (study?.shipped ?? []).map(en),
      metric: en(study?.metric),
      stack: study?.stack ?? doc.techStack ?? [],
      links: study
        ? study.links.map((l) => {
            const link = storeLink(l.href);
            return { ...link, label: { ...link.label, en: l.label } };
          })
        : doc.link
          ? [storeLink(doc.link)]
          : [],
      ...(image && { image }),
      imageAlt: en(`${doc.title} screenshot`),
    });
  }
}

async function importTestimonials(config) {
  for (const review of await fetchCollection(config, "reviews")) {
    const slug = slugify(review.name);
    const avatar = await copyAsset(review.avatar, "images/testimonials", slug, "avatar");
    await writeYaml(`content/testimonials/${slug}.yaml`, {
      name: review.name,
      role: en(review.role),
      quote: en(review.text),
      link: review.linkedinUrl ?? "",
      ...(avatar && { avatar }),
    });
  }
}

const publicSocials = new Set(["github", "linkedin"]);

async function importSocials(config) {
  for (const social of await fetchCollection(config, "socials")) {
    const slug = slugify(social.platform);
    await writeYaml(`content/socials/${slug}.yaml`, {
      platform: social.platform,
      url: social.url,
      showPublicly: publicSocials.has(slug),
      order: Number(social.order ?? 100),
    });
  }
}

async function importSettings(config) {
  const [contact] = await fetchCollection(config, "settings/contact");
  const [about] = await fetchCollection(config, "settings/about");
  const path = join(root, "content/settings.yaml");
  const current = (await exists(path)) ? yaml.load(await readFile(path, "utf8")) : {};
  const next = {
    availability: current.availability ?? en("Available — senior roles and a few product builds"),
    email: contact.email ?? current.email,
    whatsapp: contact.whatsapp ?? current.whatsapp ?? "",
    calendly: contact.calendly ?? current.calendly ?? "",
    cvUrl: about.cvUrl ?? current.cvUrl ?? "",
  };
  // Settings are merged rather than skipped: Firestore wins for contact and CV fields.
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, yaml.dump(next, { lineWidth: -1 }));
  written.push("content/settings.yaml (merged)");
}

async function importSkillGroups(config) {
  const groups = (await fetchCollection(config, "skills"))
    .sort((a, b) => Number(a.order) - Number(b.order))
    .map((group) => ({ category: group.category, tags: group.tags ?? [] }));
  const path = join(root, "content/profile.yaml");
  if (!(await exists(path))) {
    console.warn("  ! content/profile.yaml not found; skill groups not imported");
    return;
  }
  const profile = yaml.load(await readFile(path, "utf8"));
  if (profile.skillGroups?.length && !force) {
    skipped.push("content/profile.yaml (skillGroups)");
    return;
  }
  await writeFile(path, yaml.dump({ ...profile, skillGroups: groups }, { lineWidth: -1 }));
  written.push("content/profile.yaml (skillGroups)");
}

// ---- Run ---------------------------------------------------------------------------------

const config = await firestoreConfig();
const { CASE_STUDIES } = await import(pathToFileURL(join(oldSite, "assets/js/case-studies.js")).href);

console.log(
  `Importing from ${oldSite} (Firestore project ${config.projectId})${force ? " with --force" : ""}`,
);
await importProjects(config, CASE_STUDIES);
await importTestimonials(config);
await importSocials(config);
await importSettings(config);
await importSkillGroups(config);

console.log(`\nWrote ${written.length}:\n  ${written.join("\n  ")}`);
if (skipped.length)
  console.log(`\nSkipped ${skipped.length} existing (use --force to overwrite):\n  ${skipped.join("\n  ")}`);
