import { redirect } from 'next/navigation';

import RoomPlay from '~/app/game/online/room/[roomId]/play/RoomPlay';
import { auth } from '~/server/auth';

export default async function RoomPlayPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect(`/api/auth/signin?callbackUrl=/game/online/room/${roomId}/play`);
  }

  return <RoomPlay roomId={roomId} userId={session.user.id} />;
}
