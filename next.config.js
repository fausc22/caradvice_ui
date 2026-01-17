/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
      },
      {
        protocol: 'https',
        hostname: 'api.caradvice.com.ar',
      },
      {
        protocol: 'https',
        hostname: 'cdn.asofix.com',
      },
    ],
  },
  
  // Redirección de /vestri al subdominio (backup del middleware)
  async redirects() {
    return [
      {
        source: '/vestri',
        has: [
          {
            type: 'host',
            value: 'caradvice.com.ar',
          },
        ],
        destination: 'https://vestri.caradvice.com.ar',
        permanent: true, // 301
      },
      {
        source: '/vestri',
        has: [
          {
            type: 'host',
            value: 'www.caradvice.com.ar',
          },
        ],
        destination: 'https://vestri.caradvice.com.ar',
        permanent: true, // 301
      },
    ];
  },
}

module.exports = nextConfig

