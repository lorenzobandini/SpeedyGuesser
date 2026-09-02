import { existsSync } from 'fs';

import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { PrismaClient } from '@prisma/client';

if (existsSync('.env')) process.loadEnvFile();

const db = new PrismaClient({
  adapter: new PrismaLibSQL({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN!,
  }),
});

const s = await db.session.findUnique({
  where: { sessionToken: '62a9c27c3ddd413ca6ffb5d3944402af' },
});
console.log('session:', s ? `esiste, exp ${s.expires.toISOString()}` : 'MANCA');

const r = await db.room.findUnique({
  where: {
    id: (await db.room.findFirst({ orderBy: { createdAt: 'desc' } }))!.id,
  },
});
console.log('ultima room:', r?.code, r?.status, 'version', r?.version);

const players = await db.roomPlayer.findMany({
  where: { roomId: r!.id },
  select: { userId: true, isReady: true, role: true, lastSeenAt: true },
});
console.log('players:', JSON.stringify(players));

await db.$disconnect();
