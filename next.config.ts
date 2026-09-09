import type { NextConfig } from "next";

const localStorage =
  process.env.NEXT_PUBLIC_SUPABASE_URL === "http://127.0.0.1:54321";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    dangerouslyAllowLocalIP: localStorage,
    remotePatterns: [
      ...(localStorage
        ? [
            {
              protocol: "http" as const,
              hostname: "127.0.0.1",
              port: "54321",
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/favicon.png",
        destination: "/favicon.ico",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
