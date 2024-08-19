import { CiCircleInfo } from "react-icons/ci";
import { Button } from "~/components/ui/button";
import { getServerAuthSession } from "~/server/auth";
import Image from "next/image";
import Link from "next/link";

export default async function Navbar() {
  const session = await getServerAuthSession();
  const userName = session?.user?.name ?? "Ospite";
  const userImage = session?.user?.image ?? "/profile-simple.svg"; // Percorso dell'SVG di default

  return (
    <nav className="flex justify-between bg-transparent p-3">
      <div className="flex items-center">
        <Button variant={"secondary"} className="py-2 flex items-center">
          <div className="relative h-12 mr-2 flex items-center justify-center">
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
        <Link
          href={session ? "/api/auth/signout" : "/api/auth/signin"}
          className="ml-4"
        >
          <Button variant={session ? "destructive" : "secondary"}>
            {session ? "Sign out" : "Sign in"}
          </Button>
        </Link>
      </div>
      <Button variant={"ghost"} size={"icon"} className="py-2">
        <CiCircleInfo size={38} />
      </Button>
    </nav>
  );
}
