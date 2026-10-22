import Image from "next/image";
import { ArrowOut } from "@/components/icons";
import { ExternalLink } from "@/components/external-link";
import { LocalizedText } from "@/components/localized-text";
import { localize, type Project } from "@/lib/content";

export function ProjectMeta({ project, locale }: { project: Project; locale: string }) {
  return (
    <p className="m-0 font-mono text-[13px] text-muted rtl:font-sans">
      <LocalizedText value={project.category} locale={locale} /> · <bdi>{project.year}</bdi>
    </p>
  );
}

export function StoreLinks({ project, locale }: { project: Project; locale: string }) {
  return project.links.map((link) => (
    <ExternalLink
      key={link.href}
      href={link.href}
      className="inline-flex h-12 items-center gap-1.5 px-2 text-[15px] font-semibold underline underline-offset-4 hover:text-accent"
    >
      <LocalizedText value={link.label} locale={locale} />
      <ArrowOut />
    </ExternalLink>
  ));
}

const tileSizes = {
  hero: { box: "size-52 md:size-72 rounded-[32px] p-7", sizes: "288px" },
  large: { box: "size-44 md:size-60 rounded-[28px] p-6", sizes: "240px" },
  small: { box: "size-32 rounded-[22px] p-4", sizes: "128px" },
};

/** Project images are logos and app icons, so they sit at a fixed size on a white tile. */
export function LogoTile({
  project,
  locale,
  size,
  priority,
}: {
  project: Project;
  locale: string;
  size: keyof typeof tileSizes;
  priority?: boolean;
}) {
  if (!project.image) return null;
  return (
    <div
      className={`relative bg-surface shadow-[0_24px_48px_-28px_rgba(17,19,24,0.35)] ${tileSizes[size].box}`}
    >
      <div className="relative size-full">
        <Image
          src={project.image}
          alt={localize(project.imageAlt, locale)}
          fill
          priority={priority}
          sizes={tileSizes[size].sizes}
          className="object-contain"
        />
      </div>
    </div>
  );
}

// Where each screen sits in the fan: the first is in front, the others lean out behind it.
const fanLayouts = {
  featured: [
    "left-1/2 top-10 z-10 w-[30%] -translate-x-1/2",
    "left-[10%] top-20 w-[25%] -rotate-6",
    "right-[10%] top-20 w-[25%] rotate-6",
  ],
  // Shifted toward the end so the logo badge in the start corner never covers a screen.
  card: ["start-[26%] top-9 z-10 w-[34%] -rotate-[4deg]", "end-[7%] top-16 w-[34%] rotate-[5deg]"],
};

/**
 * The visual half of a project card: real app screens fanned out and cropped by the card's
 * bottom edge, with the logo as a small badge. Falls back to the logo tile without screens.
 */
export function ScreenFan({
  project,
  locale,
  variant,
  priority,
}: {
  project: Project;
  locale: string;
  variant: keyof typeof fanLayouts;
  priority?: boolean;
}) {
  const layout = fanLayouts[variant];
  const picked = project.cardScreens.length
    ? project.cardScreens.map((number) => (number ? project.screenshots[number - 1] : undefined))
    : project.screenshots;
  const screens = picked.filter((screen) => screen !== undefined).slice(0, layout.length);
  if (screens.length === 0) {
    return (
      <LogoTile
        project={project}
        locale={locale}
        size={variant === "featured" ? "large" : "small"}
        priority={priority}
      />
    );
  }

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {screens.map((screen, index) => (
        <Image
          key={screen.image}
          src={screen.image}
          alt=""
          width={screen.width}
          height={screen.height}
          priority={priority && index === 0}
          sizes={variant === "featured" ? "220px" : "160px"}
          className={`absolute h-auto rounded-[18px] border border-line shadow-[0_24px_48px_-24px_rgba(17,19,24,0.5)] ${layout[index]}`}
        />
      ))}
      {project.image && (
        <span className="absolute start-5 top-5 z-20 flex size-14 items-center justify-center rounded-2xl bg-surface p-2 shadow-[0_12px_24px_-12px_rgba(17,19,24,0.4)]">
          <Image src={project.image} alt="" width={40} height={40} className="size-10 object-contain" />
        </span>
      )}
    </div>
  );
}

/**
 * App screens in a strip that scrolls sideways (and follows the page direction in Arabic).
 * The strip is focusable so keyboard users can scroll it with the arrow keys.
 */
export function ScreenStrip({
  project,
  locale,
  labelledBy,
}: {
  project: Project;
  locale: string;
  labelledBy: string;
}) {
  return (
    <div
      role="region"
      aria-labelledby={labelledBy}
      tabIndex={0}
      className="-mx-6 snap-x snap-mandatory scroll-px-6 overflow-x-auto px-6 pb-4 focus-visible:outline-2 focus-visible:outline-accent"
    >
      <ul className="m-0 flex w-max list-none gap-4 p-0 md:gap-5">
        {project.screenshots.map((screen) => (
          <li key={screen.image} className="w-50 shrink-0 snap-start md:w-62.5">
            <Image
              src={screen.image}
              alt={localize(screen.alt, locale)}
              width={screen.width}
              height={screen.height}
              sizes="(min-width: 768px) 250px, 200px"
              className="h-auto w-full rounded-[22px] border border-line bg-sunken"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

// Each tag is isolated as left-to-right text, but the row still follows the page direction.
export function Stack({ items, tone = "light" }: { items: readonly string[]; tone?: "light" | "dark" }) {
  return (
    <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
      {items.map((item) => (
        <li
          key={item}
          className={
            tone === "dark"
              ? "rounded-md border border-[#343842] px-2.5 py-0.5 font-mono text-[12.5px] text-[#c9ccd2]"
              : "rounded-md bg-chip px-2.5 py-1 font-mono text-[12.5px]"
          }
        >
          <bdi>{item}</bdi>
        </li>
      ))}
    </ul>
  );
}
