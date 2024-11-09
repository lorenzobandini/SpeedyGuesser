import { getServerAuthSession } from "~/server/auth";
import RoomClient from "./RoomClient";

export default async function LocalMode() {
  const session = await getServerAuthSession();

  return (    
    <div className="flex h-full flex-col justify-between">
      <RoomClient session={session} />
    </div>
  );
}
