import { getServerAuthSession } from "~/server/auth";
import StatsClient from "./StatsClient";
import { db } from "~/server/db";
import { redirect } from "next/navigation";

export default async function GamePage({
  params,
}: {
  params: { gameId: string };
}) {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/auth/signin");
  }

  const gameId = params.gameId;

  const game = await db.game.findUnique({
    where: { id: gameId },
  });

  if (!game || game.userId !== session.user.id) {
    redirect("/");
  }

  return (
    <div className="flex h-full flex-col justify-between">
      <StatsClient game={game} />
    </div>
  );
}
