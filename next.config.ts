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
    return config;
  },
};

export default nextConfig;
