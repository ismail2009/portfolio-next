import type { Metadata } from "next";
import { About } from "@/components/home/about";
import { Contact } from "@/components/home/contact";
import { ExperienceList } from "@/components/home/experience-list";
import { Hero } from "@/components/home/hero";
import { ProofBar } from "@/components/home/proof-bar";
import { SelectedWork } from "@/components/home/selected-work";
import { Services } from "@/components/home/services";
import { routing } from "@/i18n/routing";
import { getProfile, getPublicSocials, getSettings } from "@/lib/content";
import { siteUrl } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: {
      canonical: `/${locale}`,
      languages: { ...Object.fromEntries(routing.locales.map((l) => [l, `/${l}`])), "x-default": "/en" },
    },
  };
}

export default async function HomePage() {
  return (
    <>
      <PersonJsonLd />
      <Hero />
      <ProofBar />
      <SelectedWork />
      <ExperienceList />
      <Services />
      <About />
      <Contact />
    </>
  );
}

/** Structured data so search engines can show the profile (name, role, links). */
async function PersonJsonLd() {
  const [profile, settings, socials] = await Promise.all([getProfile(), getSettings(), getPublicSocials()]);
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Ismail S. Al-Saleh",
    alternateName: "إسماعيل الصالح",
    jobTitle: "Senior React and React Native Developer",
    url: siteUrl,
    email: `mailto:${settings.email}`,
    knowsLanguage: ["en", "ar"],
    knowsAbout: profile.tools,
    alumniOf: { "@type": "CollegeOrUniversity", name: profile.education.school.en },
    sameAs: socials.map((social) => social.url),
  };

  return (
    <script
      type="application/ld+json"
      // Escape "<" so content can never close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
