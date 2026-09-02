// Importa e valida le variabili d'ambiente solo se non è impostata SKIP_ENV_VALIDATION
if (!process.env.SKIP_ENV_VALIDATION) {
  await import('./src/env.js');
}

/** @type {import("next").NextConfig} */
const nextConfig = {
  // libsql è nativo/node-only: non va bundlelato da webpack
  serverExternalPackages: [
    'libsql',
    '@libsql/client',
    '@prisma/adapter-libsql',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
      },
    ],
  },
  // eslint-disable-next-line @typescript-eslint/require-await -- la firma Next richiede Promise
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
