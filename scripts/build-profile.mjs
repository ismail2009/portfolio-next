// Builds one file an AI assistant can fill job applications from: the public profile from the site
// (/<lang>/profile.md) plus the private details in private/application.md, which never leaves this machine.
//
//   npm run profile -- [--lang en|ar] [--from http://localhost:3000]
//
// The first run creates private/application.md from scripts/application-template.md for you to fill in.
// The public part comes from --from, else the local dev server if it's running, else the live site.

import { access, copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const args = process.argv.slice(2);
const option = (name) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : undefined;
};
const lang = option("lang") ?? "en";
const root = process.cwd();
const privateDir = join(root, "private");
const detailsPath = join(privateDir, "application.md");
const outputPath = join(privateDir, `profile-full.${lang}.md`);

const exists = (path) =>
  access(path).then(
    () => true,
    () => false,
  );

if (!["en", "ar"].includes(lang)) {
  console.error(`Unknown --lang "${lang}". Use en or ar.`);
  process.exit(1);
}

await mkdir(privateDir, { recursive: true });
if (!(await exists(detailsPath))) {
  await copyFile(join(root, "scripts", "application-template.md"), detailsPath);
  console.log(`Created ${detailsPath}\nFill it in, then run npm run profile again.`);
  process.exit(0);
}

async function fetchPublicProfile() {
  const sources = option("from")
    ? [option("from")]
    : ["http://localhost:3000", process.env.NEXT_PUBLIC_SITE_URL ?? "https://ismail-alsaleh.vercel.app"];
  for (const base of sources) {
    const url = `${base.replace(/\/$/, "")}/${lang}/profile.md`;
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
      if (response.ok) return { url, text: await response.text() };
      console.warn(`${url} answered ${response.status}, trying the next source.`);
    } catch {
      console.warn(`${url} is not reachable, trying the next source.`);
    }
  }
  console.error(
    "Couldn't load the public profile. Start the dev server (npm run dev) or pass --from <site url>.",
  );
  process.exit(1);
}

const [{ url, text: publicProfile }, details] = await Promise.all([
  fetchPublicProfile(),
  readFile(detailsPath, "utf8"),
]);

// The template's <!-- guidance --> is for the person filling it in, not for the assistant.
const privateDetails = details.replace(/<!--[\s\S]*?-->\n*/g, "").trim();

const instructions = `# Instructions for the AI assistant

You are helping me, Ismail, fill in job applications. Everything you need about me is below:
my private details first, then my public profile from ${url}.

- Use only what is written here. Never invent dates, numbers, employers, skills or links.
- If a field is empty here or the form asks something not covered, ask me instead of guessing.
- Answer in the form's language. Adapt the ready answers to the company and role instead of pasting them.
- Respect each field's character limit and format (dates, phone, salary currency).
- Never submit or send a form. Stop before the final button so I can review it.
- Don't share the private details anywhere except the application I'm filling in.`;

await writeFile(
  outputPath,
  `${instructions}\n\n---\n\n${privateDetails}\n\n---\n\n${publicProfile.trim()}\n`,
);
console.log(`Wrote ${outputPath}\nPublic part from ${url}`);
