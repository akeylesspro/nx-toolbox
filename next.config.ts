import type { NextConfig } from "next";
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

const nextConfig: NextConfig = withBundleAnalyzer({
    experimental: {
        esmExternals: true,
    },
    staticPageGenerationTimeout: 60,
    reactStrictMode: false,
});

export default nextConfig;
