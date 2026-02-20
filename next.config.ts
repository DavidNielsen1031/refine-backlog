import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // groombacklog.com → refinebacklog.com (301 permanent)
      // Captures old domain traffic + SEO link equity
      {
        source: "/:path*",
        has: [{ type: "host", value: "groombacklog.com" }],
        destination: "https://refinebacklog.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.groombacklog.com" }],
        destination: "https://refinebacklog.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
