'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import SelectionForm from '~/app/_components/SelectionForm';
import { Button } from '~/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '~/components/ui/input-otp';
import { api } from '~/trpc/react';

export default function OnlineClient() {
  const router = useRouter();
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
      { onSuccess: room => router.push(`/game/online/room/${room.roomId}`) },
    );
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SelectionForm onStart={handleCreate} buttonText="Crea stanza" />
      {createRoom.error && (
        <p className="mb-4 text-center font-bold text-red-700">
          {createRoom.error.message}
        </p>
      )}

      <div className="flex flex-col items-center gap-4 px-4 pb-16">
        <span className="text-2xl font-bold text-white">
          Hai un codice da 4 cifre?
        </span>
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
          <p className="font-bold text-red-700">{joinRoom.error.message}</p>
        )}
      </div>
    </div>
  );
}
