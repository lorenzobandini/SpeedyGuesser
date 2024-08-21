import InfoButton  from "./(buttons)/infoButton";
import LogButton from "./(buttons)/logButton";
import ProfileButton from "./(buttons)/profileButton";
import GuestProfileButton from "./(buttons)/guestProfileButton";
import { getServerAuthSession } from "~/server/auth";

export default async function Navbar() {
  const session = await getServerAuthSession();

  return (
    <nav className="flex justify-between bg-transparent p-3">
      <div className="flex items-center">
        {session ? <ProfileButton /> : <GuestProfileButton />}
        <LogButton />
      </div>
      <InfoButton />
    </nav>
  );
}
