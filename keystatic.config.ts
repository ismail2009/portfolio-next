import { collection, config, fields, singleton } from "@keystatic/core";

// Edits are committed to GitHub once the Keystatic GitHub app is connected (its env vars are set);
// until then, and always in development, they are saved to local files.
// This config also runs in the browser, which only sees NEXT_PUBLIC_ variables, so the switch must be
// a public one: keyed on the client ID, the admin UI would run in local mode against a GitHub server.
const useGitHub =
  process.env.NODE_ENV !== "development" && Boolean(process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG);

const storage = useGitHub
  ? ({ kind: "github", repo: { owner: "ismail2009", name: "portfolio-next" } } as const)
  : ({ kind: "local" } as const);

// Local mode has no login: its API writes files for anyone who calls it. So outside development the
// admin only exists once GitHub login is connected; until then /keystatic and its API return 404.
export const adminEnabled = process.env.NODE_ENV === "development" || useGitHub;

// Every text field has a max length, sized to where it shows on the site, so a headline or label
// can't grow past the lines its layout allows. Raise a limit here rather than squeezing the design.
const upTo = (max: number, description?: string) =>
  [description, `Up to ${max} characters.`].filter(Boolean).join(" ");

const text = (label: string, max: number, options: { description?: string; required?: boolean } = {}) =>
  fields.text({
    label,
    description: upTo(max, options.description),
    validation: { isRequired: options.required ?? false, length: { max } },
  });

// English is required; Arabic falls back to English on /ar until it is filled in.
const localized = (label: string, max: number, options: { multiline?: boolean; required?: boolean } = {}) =>
  fields.object(
    {
      en: fields.text({
        label: "English",
        description: upTo(max),
        multiline: options.multiline,
        validation: { isRequired: options.required ?? true, length: { max } },
      }),
      ar: fields.text({
        label: "Arabic",
        description: upTo(max),
        multiline: options.multiline,
        validation: { length: { max } },
      }),
    },
    { label, layout: [6, 6] },
  );

const localizedList = (label: string, itemLabel: string, max: number) =>
  fields.array(localized(itemLabel, max), {
    label,
    itemLabel: (props) => props.fields.en.value || itemLabel,
  });

export default config({
  storage,
  ui: {
    brand: { name: "Ismail Al-Saleh" },
    navigation: {
      Content: ["projects", "experience", "testimonials"],
      Profile: ["profile", "socials", "settings"],
    },
  },
  collections: {
    projects: collection({
      label: "Projects",
      slugField: "title",
      path: "content/projects/*",
      format: { data: "yaml" },
      columns: ["title", "order"],
      schema: {
        title: fields.slug({
          name: { label: "Title", description: upTo(30), validation: { length: { max: 30 } } },
        }),
        visible: fields.checkbox({ label: "Show on the site", defaultValue: true }),
        featured: fields.checkbox({
          label: "Featured",
          description: "The large card at the top of Selected work. Only one project should be featured.",
        }),
        caseStudy: fields.checkbox({
          label: "Has a case study page",
          description: "Selected work and /work/<slug> only list projects with this ticked.",
        }),
        order: fields.integer({
          label: "Order",
          description: "Lower numbers come first.",
          defaultValue: 100,
        }),
        category: localized("Category", 50, { required: false }),
        year: text("Year", 12, { description: "e.g. 2022 or 2022–2023." }),
        client: text("Client", 60),
        role: localized("My role", 40, { required: false }),
        engagement: localized("Engagement", 60, { required: false }),
        // The case study page headline: 120 characters is about three lines at desktop width.
        outcome: localized("Outcome (one sentence)", 120, { multiline: true }),
        problem: localized("The problem", 280, { multiline: true, required: false }),
        decisions: localizedList("Key decisions", "Decision", 160),
        shipped: localizedList("What shipped", "Item", 90),
        metric: localized("Proof (short)", 40, { required: false }),
        stack: fields.array(text("Technology", 30), {
          label: "Stack",
          itemLabel: (props) => props.value,
        }),
        links: fields.array(
          fields.object({
            label: localized("Label", 20),
            href: fields.url({ label: "URL", validation: { isRequired: true } }),
          }),
          { label: "Links", itemLabel: (props) => props.fields.label.fields.en.value || "Link" },
        ),
        image: fields.image({
          label: "Screenshot",
          directory: "public/images/projects",
          publicPath: "/images/projects/",
        }),
        imageAlt: localized("Screenshot description", 120, { required: false }),
        screenshots: fields.array(
          fields.object({
            image: fields.image({
              label: "Image",
              directory: "public/images/projects",
              publicPath: "/images/projects/",
              validation: { isRequired: true },
            }),
            alt: localized("Description", 120),
          }),
          {
            label: "App screens",
            description: "Phone screenshots, shown in a scrolling strip on the case study page.",
            itemLabel: (props) => props.fields.alt.fields.en.value || "Screen",
          },
        ),
        cardScreens: fields.array(fields.integer({ label: "Screen number", validation: { min: 1 } }), {
          label: "Screens on the home page card",
          description:
            "Which app screens (1 = first) the Selected work card fans out, front one first. Empty uses the first ones.",
          itemLabel: (props) => `Screen ${props.value ?? ""}`,
        }),
        heroImage: fields.image({
          label: "Home page phone screen",
          description:
            "The bare app screen (no device frame or store caption) shown in the hero phone. Leave empty to leave this project out.",
          directory: "public/images/projects",
          publicPath: "/images/projects/",
        }),
        heroImageAlt: localized("Home page phone screen — description", 120, { required: false }),
        banner: fields.image({
          label: "Case study banner",
          description:
            "A wide image (about 2.2:1) shown under the case study header: the app's screens on its brand colours, with no text, since the page already has the title. Leave empty for none.",
          directory: "public/images/projects",
          publicPath: "/images/projects/",
        }),
        bannerAlt: localized("Case study banner — description", 120, { required: false }),
      },
    }),

    experience: collection({
      label: "Experience",
      slugField: "company",
      path: "content/experience/*",
      format: { data: "yaml" },
      columns: ["company", "start"],
      schema: {
        company: fields.slug({
          name: { label: "Company", description: upTo(40), validation: { length: { max: 40 } } },
        }),
        companyAr: text("Company (Arabic)", 40, { description: "Leave empty to use the English name." }),
        role: localized("Role", 60),
        type: localized("Type", 40, { required: false }),
        start: fields.date({ label: "Start", validation: { isRequired: true } }),
        end: fields.date({ label: "End", description: "Leave empty if this is your current role." }),
        outcome: localized("What shipped", 500, { multiline: true }),
        tags: fields.array(text("Tag", 30), {
          label: "Tags",
          itemLabel: (props) => props.value,
        }),
        caseStudy: fields.relationship({ label: "Case study", collection: "projects" }),
        logo: fields.image({
          label: "Company logo",
          description:
            "The company's own logo, shown on a white tile. Without one, the case study's app icon is used.",
          directory: "public/images/companies",
          publicPath: "/images/companies/",
        }),
        phase: fields.select({
          label: "Career phase",
          description: "Experience is grouped into these three stages of the story, newest first.",
          options: [
            { label: "Scaling — products in production", value: "scaling" },
            { label: "Building — shipping apps", value: "building" },
            { label: "Learning — bootcamp and first product", value: "learning" },
          ],
          defaultValue: "building",
        }),
      },
    }),

    testimonials: collection({
      label: "Testimonials",
      slugField: "name",
      path: "content/testimonials/*",
      format: { data: "yaml" },
      schema: {
        name: fields.slug({
          name: { label: "Name", description: upTo(40), validation: { length: { max: 40 } } },
        }),
        role: localized("Role", 60),
        quote: localized("Quote", 300, { multiline: true }),
        link: fields.url({ label: "Link (e.g. LinkedIn recommendation)" }),
        avatar: fields.image({
          label: "Photo",
          directory: "public/images/testimonials",
          publicPath: "/images/testimonials/",
        }),
      },
    }),

    socials: collection({
      label: "Social links",
      slugField: "platform",
      path: "content/socials/*",
      format: { data: "yaml" },
      columns: ["platform", "showPublicly"],
      schema: {
        platform: fields.slug({
          name: { label: "Platform", description: upTo(30), validation: { length: { max: 30 } } },
        }),
        url: fields.url({ label: "URL", validation: { isRequired: true } }),
        showPublicly: fields.checkbox({ label: "Show on the site" }),
        order: fields.integer({ label: "Order", defaultValue: 100 }),
      },
    }),
  },

  singletons: {
    profile: singleton({
      label: "Profile",
      path: "content/profile",
      format: { data: "yaml" },
      schema: {
        photo: fields.image({
          label: "Photo",
          description: "Square, shown round in the header and in About.",
          directory: "public/images/profile",
          publicPath: "/images/profile/",
        }),
        heroTitle: localized("Hero headline", 60),
        heroAccent: localized("Hero headline — highlighted ending", 30),
        heroDescription: localized("Hero description", 220, { multiline: true }),
        shipLog: fields.array(
          fields.object({
            when: text("When", 10, { description: "e.g. 2025 or 2019–22." }),
            what: localized("What", 40),
            detail: localized("Detail", 70),
          }),
          {
            label: "Hero ship log",
            itemLabel: (props) => `${props.fields.when.value} ${props.fields.what.fields.en.value}`,
          },
        ),
        shipLogSummary: localized("Hero ship log — last line", 50),
        clients: fields.array(text("Client", 30), {
          label: "Shipped for (client names)",
          itemLabel: (props) => props.value,
        }),
        metrics: fields.array(fields.object({ value: text("Value", 10), label: localized("Label", 40) }), {
          label: "Metrics",
          itemLabel: (props) => props.fields.value.value || "Metric",
        }),
        aboutTitle: localized("About headline", 80),
        aboutBody: localized("About text", 600, { multiline: true }),
        tools: fields.array(text("Tool", 25), {
          label: "Tools shown in About",
          itemLabel: (props) => props.value,
        }),
        skillGroups: fields.array(
          fields.object({
            category: text("Category", 30),
            tags: fields.array(text("Skill", 40), {
              label: "Skills",
              itemLabel: (props) => props.value,
            }),
          }),
          { label: "Skill groups (full list)", itemLabel: (props) => props.fields.category.value || "Group" },
        ),
        education: fields.object(
          {
            degree: localized("Degree", 50),
            school: localized("School", 50),
            graduation: text("Graduation year", 10),
          },
          { label: "Education" },
        ),
        training: fields.array(
          fields.object({
            title: localized("Program", 110),
            organization: localized("Organization", 90),
            dates: localized("Dates", 40, { required: false }),
          }),
          {
            label: "Training programs",
            itemLabel: (props) => props.fields.title.fields.en.value || "Program",
          },
        ),
      },
    }),

    settings: singleton({
      label: "Site settings",
      path: "content/settings",
      format: { data: "yaml" },
      schema: {
        availability: localized("Availability badge", 60),
        email: text("Email", 100, { required: true }),
        whatsapp: fields.url({ label: "WhatsApp link" }),
        calendly: fields.url({ label: "Calendly link" }),
        cvUrl: fields.url({
          label: "CV download link",
          description:
            "Paste the Google Drive share link (shared as 'Anyone with the link'). The site turns it into a direct download.",
        }),
      },
    }),
  },
});
