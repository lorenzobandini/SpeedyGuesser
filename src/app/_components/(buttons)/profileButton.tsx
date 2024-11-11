"use client";

import { useState } from "react";
import ProfileContent from "../(dialogPages)/profilePage";
import { Button } from "~/components/ui/button";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import type { Session } from "next-auth";

export default function ProfilePage({ session }: { session: Session | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const closeDialog = () => setIsOpen(false);

  const userName = session?.user?.name;
  const userImage = session?.user?.image;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
        <div className="flex flex-col items-center justify-center  text-dark">
          <div className="w-full max-w-md rounded-lg bg-light p-8 shadow-lg">
            <div className="flex items-center justify-center">
              {userImage && (
                <Image
                  src={userImage}
                  alt="User Image"
                  width={100}
                  height={100}
                  className="rounded-full"
                />
              )}
            </div>
            <h1 className="mt-4 text-center text-2xl font-bold">{userName}</h1>
            <ProfileContent closeDialog={closeDialog} />
          </div>
        </div>
        <VisuallyHidden.Root>
          <DialogTitle>Informazioni</DialogTitle>
          <DialogDescription>Informazioni sulla pagina</DialogDescription>
          <DialogHeader>Header</DialogHeader>
        </VisuallyHidden.Root>
      </DialogContent>
    </Dialog>
  );
}
