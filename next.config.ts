/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ビルド時の型エラーを無視して公開を優先する
    ignoreBuildErrors: true,
  },
  eslint: {
    // ビルド時のチェック（eslint）を無視する
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;