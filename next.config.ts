import type { NextConfig } from "next";

const localStorage = [
  "http://127.0.0.1:54321",
  "http://127.0.0.1:54331",
].includes(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");

const nextConfig: NextConfig = {
  experimental: { serverActions: { bodySizeLimit: "12mb" } },
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowLocalIP: localStorage,
    remotePatterns: [
      ...(localStorage
        ? [
            {
              protocol: "http" as const,
              hostname: "127.0.0.1",
              port: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).port,
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
