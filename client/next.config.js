/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /* Creating "proxy" */
  async rewrites() {
    return [
      {
        source: "/api/:slug*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/:slug*`,
      },
    ];
  },
  /* For making svgs easier to use */
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};

module.exports = nextConfig;
