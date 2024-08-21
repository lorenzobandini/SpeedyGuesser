import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "~/components/ui/dialog";
import { getServerAuthSession } from "~/server/auth";
import Image from "next/image";
import ProfilePage from "../(dialogPages)/profilePage";

export default async function ProfileButton() {
  const session = await getServerAuthSession();
  const userName = session?.user?.name 
  const userImage = session?.user?.image 

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"personal"} className="group flex items-center py-2">
          <div className="relative mr-2 flex h-12 items-center justify-center">
            {userImage &&
              <Image
                src={userImage}
                alt="User profile"
                width={34}
                height={34}
                className="rounded-full"
              />         
            }
          </div>
          <span>{userName}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
            <ProfilePage />
      </DialogContent>
    </Dialog>
  );
}
