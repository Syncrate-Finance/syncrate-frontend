import { withPayload } from "@payloadcms/next/withPayload";

export default withPayload({
  poweredByHeader: false,
  serverExternalPackages: ["@coinbase/cdp-sdk"],
  // Prepared app subdomain entry point. This does not attach a domain or modify DNS.
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/",
          has: [{ type: "host", value: "app\\.syncrate\\.org" }],
          destination: "/dashboard",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
});
