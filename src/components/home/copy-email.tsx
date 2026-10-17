"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function CopyEmail({ email }: { email: string }) {
  const t = useTranslations("Contact");
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(email);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch {
          window.location.href = `mailto:${email}`;
        }
      }}
      className="min-h-11 cursor-pointer rounded-lg border border-line bg-transparent px-3 text-sm font-semibold text-ink hover:border-line-strong"
    >
      <span aria-live="polite">{copied ? t("copied") : t("copy")}</span>
    </button>
  );
}
