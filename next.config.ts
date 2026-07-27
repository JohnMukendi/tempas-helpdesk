import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dashboard is always dynamic (authenticated, live Supabase data)
  // so disable static prerendering to avoid build-time env var errors.
  experimental: {
    // Turbopack stable in Next 16
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
