import Link from "next/link";
import { Button } from "~/components/ui/button";
import { getServerAuthSession } from "~/server/auth";
import RoomButton from "~/app/_components/(buttons)/RoomButton";

export default async function SelectMode() {

    const session = await getServerAuthSession();

    return (
        <div className="flex flex-col h-full">
        <div className="flex flex-grow flex-col items-center justify-center">
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
                Speedy<span className="text-dark">Guesser</span>
            </h1>
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 text-center">
                    <h2 className="text-3xl font-bold">Single Player</h2>
                </div>
                <Link href="/game/offline">
                    <Button variant={"personal"} size={"xl"}>Offline</Button>
                </Link>
                {session ? (
                    <Link href="/game/single">
                        <Button variant={"personal"} size={"xl"}>Single</Button>
                    </Link>
                ) : (
                    <Button variant={"personal"} size={"xl"} disabled>Single</Button>
                )}
                <div className="col-span-2 text-center mt-8">
                    <h2 className="text-3xl font-bold">Multiplayer</h2>
                </div>
                {session ? (
                    <>
                        <RoomButton mode="local" />
                        <Button variant={"personal"} size={"xl"} disabled>Online</Button>
                    </>
                ) : (
                    <>
                        <Button variant={"personal"} size={"xl"} disabled>Local</Button>
                        <Button variant={"personal"} size={"xl"} disabled>Online</Button>
                    </>
                )}
            </div>
            </div>
        </div>
        </div>
    );
}