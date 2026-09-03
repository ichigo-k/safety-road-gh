import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits a self-contained server bundle with only the node_modules actually
  // reached at runtime, so the container image ships ~200MB instead of the
  // whole dependency tree.
  output: "standalone",

  // The repo root is one level up (mobile/ is a sibling), so tracing has to
  // start there or the standalone build misses files.
  outputFileTracingRoot: process.cwd(),

  /**
   * Cache policy for the bundled PWA at /app.
   *
   * This is what makes "push a new version and users get it" actually true.
   * Expo emits content-hashed bundles, so those are safe to cache forever —
   * a new build produces new filenames. The entry HTML is what points at
   * them, so if a browser caches that, the user is pinned to whatever bundle
   * was current the day they first opened it, and no redeploy will ever
   * reach them.
   */
  async headers() {
    return [
      {
        // Entry points: always revalidate.
        source: '/app/:path*.html',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, must-revalidate' },
        ],
      },
      {
        source: '/app',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, must-revalidate' },
        ],
      },
      {
        // Hashed assets: immutable, because the name changes when the
        // content does.
        source: '/app/_expo/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

export default nextConfig;
