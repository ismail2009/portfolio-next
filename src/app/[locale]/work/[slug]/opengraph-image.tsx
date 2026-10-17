import { getCaseStudies, getCaseStudy } from "@/lib/content";
import { renderShareImage, shareImageSize } from "@/lib/share-image";

export const alt = "Case study by Ismail Al-Saleh";
export const size = shareImageSize;
export const contentType = "image/png";

export async function generateStaticParams() {
  return (await getCaseStudies()).map((project) => ({ slug: project.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getCaseStudy(slug);

  return renderShareImage({
    eyebrow: project ? `Case study · ${project.title}` : "Case study",
    title: project?.outcome.en ?? "Selected work",
    footer: project ? project.stack.slice(0, 4).join(" · ") : "",
  });
}
