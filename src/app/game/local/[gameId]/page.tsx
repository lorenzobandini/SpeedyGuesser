import { getServerAuthSession } from "~/server/auth";
import GameClient from "./GameClient";

export default async function LocalMode() {
  const session = await getServerAuthSession();

  return (    
    <div className="flex h-full flex-col justify-between">
      <GameClient session={session} />
    </div>
  );
}
