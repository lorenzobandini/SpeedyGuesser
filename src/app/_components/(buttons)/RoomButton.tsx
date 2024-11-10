"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "~/components/ui/dialog";
import { useRouter } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "~/components/ui/input-otp";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { api } from "~/trpc/react";

interface RoomButtonProps {
  mode: "local" | "online";
}

export default function RoomButton({ mode }: RoomButtonProps) {
  const [open, setOpen] = useState(false);
  const [join, setJoin] = useState(false);
  const [roomNumber, setRoomNumber] = useState("");
  const router = useRouter();
  const getRoomIdByCode = api.room.getRoomIdByCode.useQuery(
    { code: parseInt(roomNumber) },
    { enabled: false }
  );

  const handleCreateRoom = () => {
    router.push(`/game/${mode}`);
    setOpen(false);
  };

  const handleJoinRoom = async () => {
    if (roomNumber.length < 4) {
      return;
    }

    try {
      const response = await getRoomIdByCode.refetch();
      const roomId = response.data?.roomId;
      if (roomId) {
        router.push(`/game/${mode}/room/${roomId}`);
        setOpen(false);
      }
    }catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <Button variant="personal" size="xl" onClick={() => setOpen(true)}>
        {mode.charAt(0).toUpperCase() + mode.slice(1)}
      </Button>
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setJoin(false);
            setRoomNumber("");
          }
          setOpen(isOpen);
        }}
      >
        <DialogContent>
          <VisuallyHidden.Root>
            <DialogTitle>Gestisci la stanza</DialogTitle>
          </VisuallyHidden.Root>
          {!join ? (
            <div className="flex flex-col items-center">
              <h2 className="mb-4 text-xl font-bold">Scegli un&apos;opzione</h2>
              <Button
                variant="personal"
                className="mb-3"
                onClick={handleCreateRoom}
              >
                Crea stanza
              </Button>
              <Button variant="personal" onClick={() => setJoin(true)}>
                Unisciti a una stanza
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <h2 className="mb-4 text-xl font-bold">
                Inserisci il numero della stanza
              </h2>
              <InputOTP
                maxLength={4}
                value={roomNumber}
                onChange={setRoomNumber}
                pattern={REGEXP_ONLY_DIGITS}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
              <Button
                onClick={handleJoinRoom}
                variant="personal"
                className="mt-4"
              >
                Unisciti
              </Button>
            </div>
          )}
          <VisuallyHidden.Root>
            <DialogDescription>
              Scegli se creare una stanza o unirti a una esistente
            </DialogDescription>
            <DialogHeader>Seleziona un&apos;opzione</DialogHeader>
          </VisuallyHidden.Root>
        </DialogContent>
      </Dialog>
    </>
  );
}
