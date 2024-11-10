import { Button } from "~/components/ui/button";
import { getServerAuthSession } from "~/server/auth";
import Image from "next/image";
import ProfilePage from "../(dialogPages)/profilePage";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";


export default async function ProfileButton() {
  const session = await getServerAuthSession();
  const userName = session?.user?.name;
  const userImage = session?.user?.image;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"personal"} className="group flex items-center py-2">
          <div className="relative mr-2 flex h-12 items-center justify-center">
            {userImage && (
              <Image
                src={userImage}
                alt="User profile"
                width={34}
                height={34}
                className="rounded-full"
              />
            )}
          </div>
          <span>{userName}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <ProfilePage />
        <VisuallyHidden.Root>
          <DialogTitle>Informazioni</DialogTitle>
          <DialogDescription>Informazioni sulla pagina</DialogDescription>
          <DialogHeader>Header</DialogHeader>
        </VisuallyHidden.Root>
      </DialogContent>
    </Dialog>
  );
}
