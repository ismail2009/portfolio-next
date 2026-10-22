"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { ArrowForward } from "@/components/icons";

export type PhoneSlide = {
  slug: string;
  name: string;
  src: string;
  alt: string;
  showLabel: string;
  caseLabel: string;
};

type Props = {
  slides: PhoneSlide[];
  label: string;
  stages: string;
  stores: string;
};

const INTERVAL_MS = 3500;

/**
 * A phone that cycles through real screens from released apps. It advances on its own unless
 * the visitor prefers reduced motion, and stops once they pick an app themselves.
 */
export function PhoneShowcase({ slides, label, stages, stores }: Props) {
  const [current, setCurrent] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setCurrent((index) => (index + 1) % slides.length), INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [auto, slides.length]);

  const slide = slides[current];
  if (!slide) return null;

  return (
    <figure aria-label={label} className="m-0 flex min-w-0 flex-[1_1_380px] flex-col items-center gap-6">
      <p className="m-0 font-mono text-[13px] tracking-[0.08em] text-muted uppercase rtl:font-sans">
        {stages}
      </p>

      <div className="relative">
        <div className="relative aspect-[9/18.5] w-[248px] rounded-[44px] bg-ink p-2.5 shadow-[0_40px_80px_-40px_rgba(17,19,24,0.6)] md:w-[270px]">
          {/* The top strip stands in for the status bar, so the notch never covers the app's own header. */}
          <div className="relative size-full overflow-hidden rounded-[35px] bg-white pt-8">
            <div className="relative size-full">
              {slides.map((item, index) => (
                <Image
                  key={item.slug}
                  src={item.src}
                  alt={index === current ? item.alt : ""}
                  aria-hidden={index !== current}
                  fill
                  priority={index === 0}
                  sizes="270px"
                  className={`object-cover object-top transition-opacity duration-700 motion-reduce:transition-none ${
                    index === current ? "opacity-100" : "opacity-0"
                  }`}
                />
              ))}
            </div>
            <span
              aria-hidden="true"
              className="absolute top-2.5 left-1/2 h-5 w-20 -translate-x-1/2 rounded-full bg-ink"
            />
          </div>
        </div>

        <p
          aria-live="polite"
          className="absolute -end-6 bottom-14 m-0 flex flex-col rounded-2xl border border-line bg-surface px-4 py-3 shadow-[0_18px_36px_-20px_rgba(17,19,24,0.45)] md:-end-14"
        >
          <span lang="en" className="font-display text-lg font-bold tracking-[-0.01em]">
            {slide.name}
          </span>
          <span className="text-[13px] text-muted">{stores}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <div className="flex gap-1">
          {slides.map((item, index) => (
            <button
              key={item.slug}
              type="button"
              aria-label={item.showLabel}
              aria-pressed={index === current}
              onClick={() => {
                setAuto(false);
                setCurrent(index);
              }}
              className="grid size-8 place-items-center rounded-full"
            >
              <span
                aria-hidden="true"
                className={`block h-2 rounded-full transition-all motion-reduce:transition-none ${
                  index === current ? "w-6 bg-accent" : "w-2 bg-line-strong"
                }`}
              />
            </button>
          ))}
        </div>
        <Link
          href={`/work/${slide.slug}`}
          className="inline-flex items-center gap-1.5 py-2 text-[15px] font-semibold underline underline-offset-4 hover:text-accent"
        >
          {slide.caseLabel}
          <ArrowForward size={16} />
        </Link>
      </div>
    </figure>
  );
}
