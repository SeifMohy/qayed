/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['chart.js', 'react-chartjs-2'],
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    esmExternals: 'loose'
  }
}

module.exports = nextConfig 