import type { NextConfig } from "next"
import withBundleAnalyzer from "@next/bundle-analyzer"
// import withPWA from "next-pwa" // Temporär deaktiviert wegen TypeScript-Fehlern

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "cyvhakrxfgqqexdbvhcs.supabase.co"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "robohash.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
    ],
    formats: ["image/webp", "image/avif"],
  },
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Preload wichtige Routen für bessere Performance
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "/api/:path*",
      },
    ]
  },
  turbopack: {},
}

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(nextConfig)
// Temporär PWA deaktiviert wegen TypeScript-Kompatibilität
// )(withPWA({
//   dest: 'public',
//   disable: process.env.NODE_ENV === 'development',
//   register: true,
//   skipWaiting: true,
// })(nextConfig))
