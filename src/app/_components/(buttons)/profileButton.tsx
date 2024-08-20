import { Button } from "~/components/ui/button";
import { getServerAuthSession } from "~/server/auth";
import Image from "next/image";

export default async function ProfileButton() {
  const session = await getServerAuthSession();
  const userName = session?.user?.name ?? "Ospite";
  const userImage = session?.user?.image ?? "/profile-simple.svg"; // Percorso dell'SVG di default
  return (
    <Button variant={"personal"} className="flex items-center py-2">
      <div className="relative mr-2 flex h-12 items-center justify-center">
        <Image
          src={userImage}
          alt="User profile"
          width={34}
          height={34}
          className="rounded-full"
        />
      </div>
      <span>{userName}</span>
    </Button>
  );
}
