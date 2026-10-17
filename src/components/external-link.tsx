import type { ComponentPropsWithoutRef } from "react";

/** Opens in a new tab with the safe rel; keeps the visible label untouched. */
export function ExternalLink({ children, ...props }: ComponentPropsWithoutRef<"a">) {
  return (
    <a target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}
