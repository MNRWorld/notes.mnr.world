/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: false,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  webpack(config) {
    // Remove any existing SVG rules
    config.module.rules = config.module.rules.filter((rule) => {
      if (rule.test) {
        return !rule.test.toString().includes("svg");
      }
      return true;
    });

    // Add our custom SVG rule
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgo: false, // Completely disable SVGO
            memo: true,
          },
        },
      ],
    });

    return config;
  },
};

export default nextConfig;
