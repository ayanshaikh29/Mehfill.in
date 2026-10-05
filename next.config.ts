import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    // Tree-shake barrel imports — big JS saving, zero behaviour change.
    optimizePackageImports: ["framer-motion", "lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
      {
        source: "/:path*.(png|jpg|jpeg|gif|webp|avif|svg|mp4|mov|ico|woff|woff2|ttf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      // Static demo sites live as plain files in public/site-N/.
      // Explicit rewrites so they resolve on localhost (next dev does not
      // serve directory index.html) as well as on Vercel production.
      { source: "/site-1", destination: "/site-1/index.html" },
      { source: "/site-1/", destination: "/site-1/index.html" },
      { source: "/site-2", destination: "/site-2/index.html" },
      { source: "/site-2/", destination: "/site-2/index.html" },
      { source: "/site-3", destination: "/site-3/index.html" },
      { source: "/site-3/", destination: "/site-3/index.html" },
      { source: "/site-4", destination: "/site-4/index.html" },
      { source: "/site-4/", destination: "/site-4/index.html" },
      {
        source: "/security.txt",
        destination: "/.well-known/security.txt",
      },
    ];
  },
};

export default nextConfig;