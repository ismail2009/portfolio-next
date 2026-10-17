import { notFound } from "next/navigation";

// Any unknown path under /en or /ar renders the designed not-found page with a 404 status.
export function generateStaticParams() {
  return [{ rest: ["not-found"] }];
}

export default function CatchAll() {
  notFound();
}
