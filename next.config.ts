import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Desabilita otimizações de imagem para export estático
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
