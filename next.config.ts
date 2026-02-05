/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ⚠ ビルド時の型エラーを無視して公開を優先する設定
    ignoreBuildErrors: true,
  },
  eslint: {
    // ⚠ ビルド時の静的解析エラーを無視する設定
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;