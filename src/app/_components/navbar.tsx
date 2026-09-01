import InfoButton from './(buttons)/infoButton';
import LogButton from './(buttons)/logButton';
import ProfilePage from './(buttons)/profileButton';
import GuestProfileButton from './(buttons)/guestProfileButton';
import { auth } from '~/server/auth';

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="flex justify-between bg-transparent p-3">
      <div className="flex items-center">
        {session ? <ProfilePage session={session} /> : <GuestProfileButton />}
        <LogButton />
      </div>
      <InfoButton />
    </nav>
  );
}
