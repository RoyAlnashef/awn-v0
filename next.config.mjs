/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // Must live under experimental in Next 16.1.x; top-level serverActions is ignored.
      // Allow 2 MB uploads plus multipart overhead.
      bodySizeLimit: "4mb",
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  redirects: async () => [
    { source: "/rooms", destination: "/groups", permanent: true },
    {
      source: "/rooms/settings",
      destination: "/groups/settings",
      permanent: true,
    },
    { source: "/popout/rooms", destination: "/popout/groups", permanent: true },
    {
      source: "/account/tour-credits",
      destination: "/account/credits",
      permanent: true,
    },
  ],
}

export default nextConfig
