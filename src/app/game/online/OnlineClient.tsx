'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import SelectionForm from '~/app/_components/SelectionForm';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '~/components/ui/input-otp';
import { api } from '~/trpc/react';

export default function OnlineClient() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const createRoom = api.room.createRoom.useMutation();
  const joinRoom = api.room.joinRoomByCode.useMutation();

  const handleCreate = async (
    language: string,
    time: string,
    passes: string,
  ) => {
    try {
      const room = await createRoom.mutateAsync({
        language,
        timeLimit: parseInt(time),
        pass: parseInt(passes),
      });
      router.push(`/game/online/room/${room.roomId}`);
    } catch {
      // error surfaced below via createRoom.error
    }
  };

  const handleJoin = (value: string) => {
    if (value.length !== 4) return;
    joinRoom.mutate(
      { code: parseInt(value) },
      {
        onSuccess: room => {
          setOpen(false);
          router.push(`/game/online/room/${room.roomId}`);
        },
      },
    );
  };

  return (
    <div className="flex min-h-full flex-col">
      <SelectionForm onStart={handleCreate} buttonText="Crea stanza" />
      {createRoom.error && (
        <p className="mb-4 text-center font-bold text-red-700">
          {createRoom.error.message}
        </p>
      )}

      <div className="flex flex-col items-center gap-3 px-4 pb-10">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant={'personal'} size={'lg'}>
              Entra con codice
            </Button>
          </DialogTrigger>
          <DialogContent className="border-dark bg-main w-full max-w-sm border-2 border-dashed sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-white">
                Inserisci il codice della stanza
              </DialogTitle>
              <DialogDescription>
                Chiedi il codice a 4 cifre a chi ha creato la stanza.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 pb-4">
              <InputOTP
                maxLength={4}
                value={code}
                onChange={setCode}
                onComplete={handleJoin}
              >
                <InputOTPGroup className="gap-2">
                  {[0, 1, 2, 3].map(i => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="border-dark bg-second text-dark h-16 w-14 rounded-xl border-2 border-dashed font-mono text-3xl font-bold first:rounded-xl last:rounded-xl"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
              <Button
                variant={'personal'}
                size={'lg'}
                onClick={() => handleJoin(code)}
                disabled={code.length !== 4 || joinRoom.isPending}
              >
                Entra
              </Button>
              {joinRoom.error && (
                <p className="font-bold text-red-700">
                  {joinRoom.error.message}
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
