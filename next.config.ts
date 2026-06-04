import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dashboard is always dynamic (authenticated, live Supabase data)
  // so disable static prerendering to avoid build-time env var errors.
  experimental: {
    // Turbopack stable in Next 16
  },
};

export default nextConfig;
