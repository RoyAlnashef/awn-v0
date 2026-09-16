import typegpuPlugin from "unplugin-typegpu/webpack"

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
  webpack: (config) => {
    config.plugins.push(
      typegpuPlugin({
        include: [/components\/orbs\/.*\.[jt]sx?$/],
      })
    )
    return config
  },
  redirects: async () => [
    { source: "/rooms", destination: "/groups", permanent: true },
    {
      source: "/rooms/settings",
      destination: "/groups/settings",
      permanent: true,
    },
    { source: "/popout/rooms", destination: "/popout/groups", permanent: true },
  ],
}

export default nextConfig
