import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // The Keystatic reader reads content/ from disk; ship it with any server function that might re-run it.
  outputFileTracingIncludes: {
    "/*": ["./content/**/*", "./src/assets/og/*"],
  },
  // Redirects run before the proxy adds a locale, so these never become /en/admin.
  async redirects() {
    return [
      { source: "/admin", destination: "/keystatic", permanent: false },
      { source: "/admin.html", destination: "/keystatic", permanent: false },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withNextIntl(nextConfig);
