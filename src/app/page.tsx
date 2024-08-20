import Navbar from "~/app/_components/navbar";
import SettingsoButton from "./_components/(buttons)/settingsButton";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#ff6600] text-white">
      <Navbar />
      <div className="flex flex-grow flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Speedy<span className="text-[#1a1a2e]">Guesser</span>
          </h1>
        </div>
      </div>
      <div className="flex justify-end p-2">
        <SettingsoButton />
      </div>
    </main>
  );
}
