/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  typescript: {
    // Enable type checking during builds
    ignoreBuildErrors: false,
  },
  eslint: {
    // Enable ESLint during builds
    ignoreDuringBuilds: false,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media2.dev.to",
      },
    ],
  },
};

export default nextConfig;
