import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Make resend optional - don't fail build if it's not installed
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        resend: 'commonjs resend',
      });
    }

    // Suppress Edge Runtime warnings for Supabase packages
    // These packages use Node.js APIs but are only used in Node.js runtime contexts
    // (middleware, API routes, server components), not in Edge Runtime
    config.ignoreWarnings = config.ignoreWarnings || [];
    config.ignoreWarnings.push({
      module: /@supabase\/(realtime-js|supabase-js)/,
      message: /A Node\.js API is used/,
    });

    return config;
  },
};

export default nextConfig;
