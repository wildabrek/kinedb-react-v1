// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Geliştirme sırasında olası sorunları görmek için true yapmanız önerilir.
  
  // Hata gizleme seçeneklerini kaldırın veya false yapın.
  // Bu, kod kalitenizi artırmanıza yardımcı olur.
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  
  // Hatalı olduğu için bu bloğu TAMAMEN KALDIRIN.
  // serverExternalPackages: [ ... ],
}

export default nextConfig;