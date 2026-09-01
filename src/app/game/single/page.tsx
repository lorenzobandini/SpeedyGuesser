import { auth } from '~/server/auth';
import SingleModeClient from './SingleModeClient';

export default async function SingleMode() {
  const session = await auth();

  return (
    <div className="flex h-full flex-col justify-between">
      <SingleModeClient session={session} />
    </div>
  );
}
