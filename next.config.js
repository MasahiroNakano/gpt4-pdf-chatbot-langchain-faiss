/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack(config) {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
  images: {
    domains: [], // add domains here if you have any external images
    unoptimized: true, // disables default image optimization
  },
};

export default nextConfig;
