/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/groups",
        destination: "/community",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
