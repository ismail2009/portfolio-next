import { routing } from "@/i18n/routing";
import { getProfile } from "@/lib/content";
import { renderShareImage, shareImageSize } from "@/lib/share-image";

export const alt = "Ismail Al-Saleh — Senior React & React Native Developer";
export const size = shareImageSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Image() {
  const profile = await getProfile();
  return renderShareImage({
    eyebrow: "Senior React & React Native Developer",
    title: profile.heroTitle.en,
    accent: profile.heroAccent.en,
    footer: "React · Next.js · React Native · TypeScript",
  });
}
