"use client";

import { useRouter } from "next/navigation";
import SelectionForm from "~/app/_components/SelectionForm";

export default function OfflineMode() {
  const router = useRouter();

  const handleStartGame = (language: string, time: string, passes: string) => {
    router.push(
      `/game/offline/play?language=${language}&time=${time}&passes=${passes}`,
    );
  };

  return (
    <div className="flex h-full flex-col justify-between">
      <SelectionForm onStart={handleStartGame} buttonText="Start Game" />
    </div>
  );
}
