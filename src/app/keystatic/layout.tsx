import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminEnabled } from "../../../keystatic.config";
import KeystaticApp from "./keystatic";

export const metadata: Metadata = {
  title: "Admin — Ismail Al-Saleh",
  robots: { index: false, follow: false },
};

// The admin is its own root layout, separate from the [locale] site.
export default function KeystaticLayout() {
  if (!adminEnabled) notFound();

  return (
    <html lang="en">
      <body>
        <KeystaticApp />
      </body>
    </html>
  );
}
