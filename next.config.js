/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['next-auth'],
  images: {
    domains: ["upcdn.io", "replicate.delivery", "lh3.googleusercontent.com"],
    unoptimized: true,
  },
  experimental: {
    allowedDevOrigins: ["https://55a9-154-120-84-187.ngrok-free.app"],
    typedRoutes: false,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/restore',
        permanent: true,
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
