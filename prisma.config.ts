import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { defineConfig } from 'prisma/config';

process.loadEnvFile();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  experimental: { adapter: true },
  engine: 'js',
  // ponytail: schema engine JS + adapter per applicare le migration direttamente a Turso; fallback: prisma migrate diff --script + turso db shell
  // eslint-disable-next-line @typescript-eslint/require-await -- la firma richiede Promise
  adapter: async () =>
    new PrismaLibSQL({
      url: process.env.DATABASE_URL!,
      authToken: process.env.DATABASE_AUTH_TOKEN!,
    }),
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
