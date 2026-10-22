"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ExternalLink } from "./external-link";

const noop = () => () => {};

type Props = {
  sections: readonly string[];
  bookUrl?: string;
};

/**
 * The phone menu: a button that slides a panel in from the end side (the right in English,
 * the left in Arabic). It closes on a link, the close button, the backdrop or Escape, moves
 * focus into the panel when it opens, and back to the button when it closes.
 */
export function MobileMenu({ sections, bookUrl }: Props) {
  const t = useTranslations("Nav");
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  // The panel is portalled to <body>: the header's backdrop blur would otherwise trap a fixed panel inside it.
  // True only in the browser (false while rendering on the server), without an extra render.
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    toggle.current?.focus();
  };

  return (
    <>
      <button
        ref={toggle}
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={t("menuOpen")}
        onClick={() => setOpen(true)}
        className="grid size-11 place-items-center rounded-[10px] border border-line bg-surface hover:border-line-strong md:hidden"
      >
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {mounted &&
        createPortal(
          <div className={`fixed inset-0 z-50 md:hidden ${open ? "" : "pointer-events-none"}`}>
            <div
              aria-hidden="true"
              onClick={close}
              className={`absolute inset-0 bg-ink/40 transition-opacity duration-300 motion-reduce:transition-none ${
                open ? "opacity-100" : "opacity-0"
              }`}
            />
            <div
              ref={panel}
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label={t("label")}
              inert={!open}
              className={`absolute inset-y-0 end-0 flex w-[min(20rem,85vw)] flex-col gap-2 bg-ground p-6 shadow-[0_0_48px_rgba(17,19,24,0.25)] transition-transform duration-300 motion-reduce:transition-none ${
                open ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
              }`}
            >
              <button
                type="button"
                aria-label={t("menuClose")}
                onClick={close}
                className="mb-4 grid size-11 place-items-center self-end rounded-[10px] border border-line bg-surface hover:border-line-strong"
              >
                <svg
                  aria-hidden="true"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
              <ul className="m-0 flex list-none flex-col p-0">
                {sections.map((section) => (
                  <li key={section} className="border-b border-line">
                    <Link
                      href={{ pathname: "/", hash: section }}
                      onClick={() => setOpen(false)}
                      className="block py-4 font-display text-2xl font-semibold no-underline hover:text-accent"
                    >
                      {t(section)}
                    </Link>
                  </li>
                ))}
              </ul>
              {bookUrl && (
                <ExternalLink
                  href={bookUrl}
                  className="mt-6 flex h-12 items-center justify-center rounded-xl bg-accent px-5 font-semibold text-white no-underline hover:bg-ink"
                >
                  {t("book")}
                </ExternalLink>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
