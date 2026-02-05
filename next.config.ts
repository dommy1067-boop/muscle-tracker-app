import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // TypeScriptエラーを完全に無視
  typescript: {
    ignoreBuildErrors: true,
  },
  // ESLintエラーを完全に無視
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 画像最適化を無効化
  images: {
    unoptimized: true,
  },
  // 実験的機能の型チェックも無効化
  experimental: {
    typedRoutes: false,
  },
}

export default nextConfig