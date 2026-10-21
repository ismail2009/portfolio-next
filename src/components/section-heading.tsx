import type { ReactNode } from "react";

export function Eyebrow({ children, tone = "light" }: { children: ReactNode; tone?: "light" | "dark" }) {
  return (
    <p
      className={`m-0 font-mono text-[13px] tracking-[0.08em] uppercase rtl:font-sans ${tone === "dark" ? "text-accent-night" : "text-accent"}`}
    >
      {children}
    </p>
  );
}

export function SectionTitle({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2
      id={id}
      className="m-0 font-display text-[clamp(34px,4vw,52px)] leading-[1.05] font-extrabold tracking-[-0.03em]"
    >
      {children}
    </h2>
  );
}
