import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { getServerAuthSession } from "~/server/auth";
import Image from "next/image";

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile Stats</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view this. {userName}
            Anyone who has this link will be able to view this. {userName}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">ciaoo</div>
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button variant={"personalDestructive"} size={"sm"}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
