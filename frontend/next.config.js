/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
        pathname: '/api/files/**', // Opcional, mas recomendado por segurança
      },
    ],
  },
};

module.exports = nextConfig;