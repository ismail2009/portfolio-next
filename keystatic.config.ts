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

// English is required; Arabic falls back to English on /ar until it is filled in.
const localized = (label: string, options: { multiline?: boolean; required?: boolean } = {}) =>
  fields.object(
    {
      en: fields.text({
        label: "English",
        multiline: options.multiline,
        validation: { isRequired: options.required ?? true },
      }),
      ar: fields.text({ label: "Arabic", multiline: options.multiline }),
    },
    { label, layout: [6, 6] },
  );

const localizedList = (label: string, itemLabel: string) =>
  fields.array(localized(itemLabel), {
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
        title: fields.slug({ name: { label: "Title" } }),
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
        category: localized("Category", { required: false }),
        year: fields.text({ label: "Year", description: "e.g. 2022 or 2022–2023" }),
        client: fields.text({ label: "Client" }),
        role: localized("My role", { required: false }),
        engagement: localized("Engagement", { required: false }),
        outcome: localized("Outcome (one sentence)", { multiline: true }),
        problem: localized("The problem", { multiline: true, required: false }),
        decisions: localizedList("Key decisions", "Decision"),
        shipped: localizedList("What shipped", "Item"),
        metric: localized("Proof (short)", { required: false }),
        stack: fields.array(fields.text({ label: "Technology" }), {
          label: "Stack",
          itemLabel: (props) => props.value,
        }),
        links: fields.array(
          fields.object({
            label: localized("Label"),
            href: fields.url({ label: "URL", validation: { isRequired: true } }),
          }),
          { label: "Links", itemLabel: (props) => props.fields.label.fields.en.value || "Link" },
        ),
        image: fields.image({
          label: "Screenshot",
          directory: "public/images/projects",
          publicPath: "/images/projects/",
        }),
        imageAlt: localized("Screenshot description", { required: false }),
        screenshots: fields.array(
          fields.object({
            image: fields.image({
              label: "Image",
              directory: "public/images/projects",
              publicPath: "/images/projects/",
              validation: { isRequired: true },
            }),
            alt: localized("Description"),
          }),
          {
            label: "App screens",
            description: "Phone screenshots, shown in a scrolling strip on the case study page.",
            itemLabel: (props) => props.fields.alt.fields.en.value || "Screen",
          },
        ),
      },
    }),

    experience: collection({
      label: "Experience",
      slugField: "company",
      path: "content/experience/*",
      format: { data: "yaml" },
      columns: ["company", "start"],
      schema: {
        company: fields.slug({ name: { label: "Company" } }),
        companyAr: fields.text({
          label: "Company (Arabic)",
          description: "Leave empty to use the English name.",
        }),
        role: localized("Role"),
        type: localized("Type", { required: false }),
        start: fields.date({ label: "Start", validation: { isRequired: true } }),
        end: fields.date({ label: "End", description: "Leave empty if this is your current role." }),
        outcome: localized("What shipped", { multiline: true }),
        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Tags",
          itemLabel: (props) => props.value,
        }),
        caseStudy: fields.relationship({ label: "Case study", collection: "projects" }),
      },
    }),

    testimonials: collection({
      label: "Testimonials",
      slugField: "name",
      path: "content/testimonials/*",
      format: { data: "yaml" },
      schema: {
        name: fields.slug({ name: { label: "Name" } }),
        role: localized("Role"),
        quote: localized("Quote", { multiline: true }),
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
        platform: fields.slug({ name: { label: "Platform" } }),
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
        heroTitle: localized("Hero headline"),
        heroAccent: localized("Hero headline — highlighted ending"),
        heroDescription: localized("Hero description", { multiline: true }),
        shipLog: fields.array(
          fields.object({
            when: fields.text({ label: "When", description: "e.g. 2025 or 2019–22" }),
            what: localized("What"),
            detail: localized("Detail"),
          }),
          {
            label: "Hero ship log",
            itemLabel: (props) => `${props.fields.when.value} ${props.fields.what.fields.en.value}`,
          },
        ),
        shipLogSummary: localized("Hero ship log — last line"),
        clients: fields.array(fields.text({ label: "Client" }), {
          label: "Shipped for (client names)",
          itemLabel: (props) => props.value,
        }),
        metrics: fields.array(
          fields.object({ value: fields.text({ label: "Value" }), label: localized("Label") }),
          { label: "Metrics", itemLabel: (props) => props.fields.value.value || "Metric" },
        ),
        aboutTitle: localized("About headline"),
        aboutBody: localized("About text", { multiline: true }),
        tools: fields.array(fields.text({ label: "Tool" }), {
          label: "Tools shown in About",
          itemLabel: (props) => props.value,
        }),
        skillGroups: fields.array(
          fields.object({
            category: fields.text({ label: "Category" }),
            tags: fields.array(fields.text({ label: "Skill" }), {
              label: "Skills",
              itemLabel: (props) => props.value,
            }),
          }),
          { label: "Skill groups (full list)", itemLabel: (props) => props.fields.category.value || "Group" },
        ),
        education: fields.object(
          {
            degree: localized("Degree"),
            school: localized("School"),
            graduation: fields.text({ label: "Graduation year" }),
          },
          { label: "Education" },
        ),
        training: fields.array(
          fields.object({
            title: localized("Program"),
            organization: localized("Organization"),
            dates: localized("Dates", { required: false }),
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
        availability: localized("Availability badge"),
        email: fields.text({ label: "Email", validation: { isRequired: true } }),
        whatsapp: fields.url({ label: "WhatsApp link" }),
        calendly: fields.url({ label: "Calendly link" }),
        cvUrl: fields.url({ label: "CV download link" }),
        cvPreviewUrl: fields.url({ label: "CV preview link" }),
      },
    }),
  },
});
