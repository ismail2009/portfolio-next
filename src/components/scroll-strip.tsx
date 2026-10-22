"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowForward } from "@/components/icons";

type Props = {
  labelledBy: string;
  prevLabel: string;
  nextLabel: string;
  children: ReactNode;
};

/**
 * A sideways strip with previous/next buttons on wider screens; touch devices swipe it natively.
 * "Next" follows the reading direction, so in Arabic it slides the other way.
 * The strip stays focusable, so keyboard users can also scroll it with the arrow keys.
 */
export function ScrollStrip({ labelledBy, prevLabel, nextLabel, children }: Props) {
  const strip = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  // In right-to-left pages scrollLeft runs from 0 down to negative values, so only its size matters.
  const update = useCallback(() => {
    const el = strip.current;
    if (!el) return;
    const offset = Math.abs(el.scrollLeft);
    setEdges({ start: offset < 4, end: offset + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  const slide = (forward: boolean) => {
    const el = strip.current;
    if (!el) return;
    const rtl = getComputedStyle(el).direction === "rtl";
    const step = el.clientWidth * 0.8 * (forward ? 1 : -1) * (rtl ? -1 : 1);
    el.scrollBy({ left: step, behavior: "smooth" });
  };

  const button =
    "absolute top-1/2 z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface shadow-[0_12px_24px_-12px_rgba(17,19,24,0.4)] transition-opacity hover:border-ink disabled:pointer-events-none disabled:opacity-0 md:grid";

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={prevLabel}
        disabled={edges.start}
        onClick={() => slide(false)}
        className={`${button} -start-3`}
      >
        <ArrowForward size={18} className="rotate-180 rtl:rotate-0" />
      </button>
      <div
        ref={strip}
        role="region"
        aria-labelledby={labelledBy}
        tabIndex={0}
        onScroll={update}
        // The arrows replace the scrollbar on wide screens; touch devices swipe.
        className="-mx-6 snap-x snap-mandatory scroll-px-6 [scrollbar-width:none] overflow-x-auto px-6 pb-4 focus-visible:outline-2 focus-visible:outline-accent [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <button
        type="button"
        aria-label={nextLabel}
        disabled={edges.end}
        onClick={() => slide(true)}
        className={`${button} -end-3`}
      >
        <ArrowForward size={18} className="rtl:rotate-180" />
      </button>
    </div>
  );
}
