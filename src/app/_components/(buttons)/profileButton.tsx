import { Button } from "~/components/ui/button";
import { getServerAuthSession } from "~/server/auth";
import Image from "next/image";

export default async function ProfileButton() {
  const session = await getServerAuthSession();
  const userName = session?.user?.name ?? "Ospite";
  const userImage = session?.user?.image ?? "/profile-simple.svg";

  return (
    <Button variant={"personal"} className="group flex items-center py-2">
      <div className="relative mr-2 flex h-12 items-center justify-center">
        {session?.user?.image ? (
          <Image
            src={userImage}
            alt="User profile"
            width={34}
            height={34}
            className="rounded-full"
          />
        ) : (
          <>
            <Image
              src="/profile-simple.svg"
              alt="User profile"
              width={34}
              height={34}
              className="rounded-full flex"
            />
            <Image
              src="/profile-simple-hover.svg"
              alt="User profile hover"
              width={34}
              height={34}
              className="rounded-full hidden group-hover:flex absolute"
            />
          </>
        )}
      </div>
      <span>{userName}</span>
    </Button>
  );
}
