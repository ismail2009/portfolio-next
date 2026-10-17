import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 18, children, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

/** Points forward in the reading direction (flips in RTL). */
export function ArrowForward(props: IconProps) {
  return (
    <Icon className="rtl:-scale-x-100" {...props}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </Icon>
  );
}

/** External link arrow; the diagonal flips in RTL. */
export function ArrowOut(props: IconProps) {
  return (
    <Icon size={14} className="rtl:-scale-x-100" {...props}>
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </Icon>
  );
}

export function Check(props: IconProps) {
  return (
    <Icon size={16} {...props}>
      <path d="M20 6L9 17l-5-5" />
    </Icon>
  );
}
