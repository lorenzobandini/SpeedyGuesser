import { CiCircleInfo } from "react-icons/ci";
import { FaUserCircle } from "react-icons/fa";
import { Button } from "~/components/ui/button";
import { getServerAuthSession } from "~/server/auth";
import Link from "next/link";

export default async function Navbar() {
  const session = await getServerAuthSession();
  const userName = session?.user?.name ?? "Ospite";

  return (
    <nav className="flex justify-between bg-transparent p-3">
      <div className="flex items-center">
        <Button variant={"secondary"} className="py-2">
          <FaUserCircle size={38} className="mr-2" />
          <span>{userName}</span>
        </Button>
        <Link href={session ? "/api/auth/signout" : "/api/auth/signin"} className="ml-4">
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