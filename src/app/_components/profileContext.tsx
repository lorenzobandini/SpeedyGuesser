import { getServerAuthSession } from "~/server/auth";
import ProfilePage from "./(buttons)/profileButton";

export default async function ProfileButton() {
  const session = await getServerAuthSession();

  return (
    <>
      <ProfilePage session={session} />
    </>
  );
}
