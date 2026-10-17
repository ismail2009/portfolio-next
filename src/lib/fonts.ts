import { Bricolage_Grotesque, IBM_Plex_Sans, IBM_Plex_Sans_Arabic, JetBrains_Mono } from "next/font/google";

export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-bricolage",
  display: "swap",
});

export const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-plex",
  display: "swap",
});

// Only fetched on pages that render Arabic glyphs, so it isn't preloaded on English pages.
// It sits first in every font stack and its files only cover Arabic, so Latin text falls through
// to the next font. No generated fallback: that would be a local Arial covering every character.
export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
});

export const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const fontVariables = [bricolage, plex, plexArabic, jetbrains].map((font) => font.variable).join(" ");
