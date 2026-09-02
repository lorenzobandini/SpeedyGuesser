import { redirect } from 'next/navigation';

import RoomLobby from '~/app/game/online/room/[roomId]/RoomLobby';
import { auth } from '~/server/auth';

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/api/auth/signin?callbackUrl=/game/online/room/${roomId}`);
  }

  return <RoomLobby roomId={roomId} userId={session.user.id} />;
}
