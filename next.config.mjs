import { withPayload } from "@payloadcms/next/withPayload";

export default withPayload({
  poweredByHeader: false,
  serverExternalPackages: ["@coinbase/cdp-sdk"],
  async redirects() {
    return [
      {
        source: "/dashboard/:path*",
        destination: "https://app.syncrate.org",
        permanent: false,
      },
      {
        source: "/app",
        destination: "https://app.syncrate.org",
        permanent: false,
      },
    ];
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
