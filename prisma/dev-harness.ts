// Dev/test harness: session tokens, test rooms, version bumps — run with `pnpm exec tsx prisma/dev-harness.ts <cmd> ...`
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

const [cmd, a, b] = process.argv.slice(2);

if (cmd === 'session') {
  const user = await db.user.findFirstOrThrow({
    where: { name: a },
    orderBy: { createdAt: 'asc' },
  });
  const sessionToken = crypto.randomUUID().replace(/-/g, '');
  await db.session.create({
    data: {
      sessionToken,
      userId: user.id,
      expires: new Date(Date.now() + 86400_000),
    },
  });
  console.log(
    JSON.stringify({ sessionToken, userId: user.id, name: user.name }),
  );
} else if (cmd === 'users') {
  const users = await db.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { createdAt: 'asc' },
  });
  console.log(JSON.stringify(users, null, 2));
} else if (cmd === 'room') {
  const userId = a!;
  const room = await db.room.create({
    data: {
      code: 1000 + Math.floor(Math.random() * 9000),
      hostUserId: userId,
      language: 'IT',
      timeLimit: 60,
      pass: 3,
      players: { create: { userId } },
    },
  });
  console.log(JSON.stringify({ roomId: room.id, code: room.code }));
} else if (cmd === 'join') {
  const [roomId, userId] = [a!, b!];
  await db.roomPlayer.create({ data: { roomId, userId } });
  await db.room.update({
    where: { id: roomId },
    data: { version: { increment: 1 } },
  });
  console.log('joined');
} else if (cmd === 'bump') {
  await db.room.update({
    where: { id: a! },
    data: { version: { increment: 1 } },
  });
  console.log('bumped');
} else if (cmd === 'cleanup') {
  const roomId = a!;
  await db.roomPlayer.deleteMany({ where: { roomId } });
  await db.room.delete({ where: { id: roomId } });
  console.log('room deleted');
} else {
  console.log(
    'usage: dev-harness.ts session <name> | users | room <userId> | join <roomId> <userId> | bump <roomId> | cleanup <roomId>',
  );
}

await db.$disconnect();
