import Image from "next/image";
import { ArrowOut } from "@/components/icons";
import { ExternalLink } from "@/components/external-link";
import { LocalizedText } from "@/components/localized-text";
import { localize, type Project } from "@/lib/content";

export function ProjectMeta({ project, locale }: { project: Project; locale: string }) {
  return (
    <p className="m-0 font-mono text-[13px] text-muted">
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
