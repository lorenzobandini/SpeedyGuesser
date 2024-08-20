import { getServerAuthSession } from "~/server/auth";
import { Button } from "~/components/ui/button";
import Link from "next/link";

export default async function LogButton() {
    const session = await getServerAuthSession();
    
    return (
        <Link
        href={session ? "/api/auth/signout" : "/api/auth/signin"}
        className="ml-4"
      >
        <Button variant={session ? "destructive" : "personal"}>
          {session ? "Sign out" : "Sign in"}
        </Button>
      </Link>
    );
}