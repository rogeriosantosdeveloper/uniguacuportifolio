/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/api/files/**',
      },
      // Suporte para backend no Render
      {
        protocol: 'https',
        hostname: '*.onrender.com',
        pathname: '/api/files/**',
      },
      // Suporte para outros domínios (adicione conforme necessário)
      {
        protocol: 'https',
        hostname: '*.render.com',
        pathname: '/api/files/**',
      },
    ],
  },
  // Expõe variáveis de ambiente para o cliente
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  },
};

module.exports = nextConfig;