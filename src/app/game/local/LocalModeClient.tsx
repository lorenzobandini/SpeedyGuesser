'use client'

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import SelectionForm from "~/app/_components/SelectionForm";
import type { Session } from "next-auth";

export default function SingleModeClient({ session }: { session: Session | null }) {
  const router = useRouter();
  const createRoom = api.game.createRoom.useMutation();

  const handleStartGame = async (
    language: string,
    time: string,
    passes: string,
  ) => {
    if (!session) {
      router.push("/api/auth/signin");
      return;
    }

    const timeLimit = parseInt(time);
    const pass = parseInt(passes);

    try {
      const { roomId } = await createRoom.mutateAsync({
        language,
        timeLimit,
        pass,
      });
      router.push(`/game/local/room/${roomId}`);
    } catch (error) {
      console.error("Errore nella creazione della stanza:", error);
    }
  };

  return (
    <div className="flex h-full flex-col justify-between">
      <SelectionForm onStart={handleStartGame} buttonText="Crea Stanza"/>
    </div>
  );
}