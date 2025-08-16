import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig = {
  output: 'export',
};

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default bundleAnalyzer(nextConfig);