import { redirect } from 'next/navigation';

import JoinClient from '~/app/game/online/join/[code]/JoinClient';
import { auth } from '~/server/auth';

export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const codeNum = Number(code);
  if (!Number.isInteger(codeNum) || codeNum < 1000 || codeNum > 9999) {
    redirect('/game/online');
  }

  const session = await auth();
  if (!session?.user) {
    redirect(`/api/auth/signin?callbackUrl=/game/online/join/${code}`);
  }

  return <JoinClient code={codeNum} />;
}
