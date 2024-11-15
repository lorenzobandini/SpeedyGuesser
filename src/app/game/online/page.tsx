import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";

export default async function OnlineMode() {
    const session = await getServerAuthSession();

    if (!session) {
        redirect("/api/auth/signin");
    }

}
