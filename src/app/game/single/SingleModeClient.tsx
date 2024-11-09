"use client";

import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import SelectionForm from "~/app/_components/SelectionForm";
import type { Session } from "next-auth";

export default function SingleModeClient({ session }: { session: Session | null }) {
  const router = useRouter();
  const createGame = api.game.createGameSingle.useMutation();
  const handleStartGame = async (
    language: string,
    time: string,
    passes: string,
  ) => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    try {
      const response = await createGame.mutateAsync({
        language,
        timeLimit: parseInt(time),
        pass: parseInt(passes),
      });
      router.push(`/game/single/${response.gameId}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex h-full flex-col justify-between">
      <SelectionForm onStart={handleStartGame} />
    </div>
  );
}