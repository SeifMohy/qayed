/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['chart.js', 'react-chartjs-2', 'styled-components'],
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    esmExternals: 'loose'
  },
  compiler: {
    styledComponents: true
  }
}

module.exports = nextConfig 