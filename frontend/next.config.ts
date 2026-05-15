import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Headers HTTP agora funcionam com SSR — CSP ativo
  async headers() {
    if (process.env.NODE_ENV !== 'production') return [];
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://plausible.io",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              `connect-src 'self' https://plausible.io ${process.env.NEXT_PUBLIC_API_BASE_URL || ""}`,
              "frame-ancestors 'none'",
              "frame-src 'self' https://js.stripe.com",
            ].join("; "),
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
