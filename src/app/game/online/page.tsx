import { redirect } from 'next/navigation';

import OnlineClient from '~/app/game/online/OnlineClient';
import { auth } from '~/server/auth';

export default async function OnlineHome() {
  const session = await auth();
  if (!session?.user) {
    redirect('/api/auth/signin?callbackUrl=/game/online');
  }

  return <OnlineClient />;
}
