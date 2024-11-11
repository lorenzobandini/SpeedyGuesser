import { getServerAuthSession } from "~/server/auth";
import LocalModeClient from "./LocalModeClient";

export default async function LocalMode() {
  const session = await getServerAuthSession();

  return (    
    <div className="flex h-full flex-col justify-between">
      <LocalModeClient session={session} />
    </div>
  );
}
