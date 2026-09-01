import { auth } from '~/server/auth';
import StatsClient from './StatsClient';
import { db } from '~/server/db';
import { redirect } from 'next/navigation';

export default async function GamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const session = await auth();
  if (!session) {
    redirect('/api/auth/signin');
  }

  const { gameId } = await params;

  const game = await db.game.findUnique({
    where: { id: gameId },
  });

  if (!game) {
    redirect('/');
  }
  if (game.userId !== session.user.id) {
    redirect('/');
  }

  return (
    <div className="flex h-full flex-col justify-between">
      <StatsClient game={game} />
    </div>
  );
}
