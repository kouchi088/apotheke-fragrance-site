/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // パフォーマンス最適化
  compress: true,
  poweredByHeader: false,
  // 静的エクスポート（必要に応じて）
  // output: 'export',
}

module.exports = nextConfig
