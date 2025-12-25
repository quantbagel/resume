/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/gust/install.sh',
        destination: 'https://raw.githubusercontent.com/quantbagel/gust/refs/heads/main/install.sh',
      },
    ];
  },
};

module.exports = nextConfig;
