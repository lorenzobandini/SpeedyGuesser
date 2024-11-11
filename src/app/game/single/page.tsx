import { getServerAuthSession } from "~/server/auth";
import SingleModeClient from "./SingleModeClient";

export default async function SingleMode() {
  const session = await getServerAuthSession();

  return (    
    <div className="flex h-full flex-col justify-between">
      <SingleModeClient session={session} />
    </div>
  );
}
