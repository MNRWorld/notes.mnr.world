/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  // Use static analyzer output and generate a stats file so parsed chunk sizes
  // are available for inspection during ANALYZE runs.
  analyzerMode: 'static',
  generateStatsFile: true,
});

const baseConfig = {
  // Keep most settings, but when running the analyzer build we remove `output: 'export'`
  // so webpack emits chunk data the analyzer can parse. This is only for ANALYZE builds.
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    // When running ANALYZE=true, emit a full webpack stats JSON so the
    // bundle-analyzer can parse parsedSize / statSize / gzipSize values.
    if (process.env.ANALYZE === 'true') {
      config.plugins.push({
        apply(compiler) {
          compiler.hooks.done.tap('WriteNextAnalyzeStats', (stats) => {
            try {
              const fs = require('fs');
              const path = require('path');
              const outDir = path.join(process.cwd(), '.next', 'analyze');
              const outFile = path.join(outDir, 'stats.json');
              fs.mkdirSync(outDir, { recursive: true });
              // Request richer stats: include module sources and chunk->module mapping so
              // the analyzer/viewer can compute parsedSize and related metrics.
              const statsJson = stats.toJson({
                all: true,
                chunks: true,
                chunkModules: true,
                modules: true,
                source: true,
              });
              fs.writeFileSync(outFile, JSON.stringify(statsJson), 'utf8');
              // eslint-disable-next-line no-console
              console.log('Wrote analyzer stats to', outFile);
            } catch (err) {
              // eslint-disable-next-line no-console
              console.error('Failed to write analyzer stats:', err && err.message);
            }
          });
        },
      });
    }

    return config;
  },
  images: {
    unoptimized: true,
  },
};

// Only set `output: 'export'` for normal builds. For analyzer runs we delete it above.
if (process.env.ANALYZE !== 'true') {
  baseConfig.output = 'export';
}

module.exports = withBundleAnalyzer(baseConfig);
