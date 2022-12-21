/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:slug*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/:slug*`,
      },
    ];
  },
};

module.exports = nextConfig;
