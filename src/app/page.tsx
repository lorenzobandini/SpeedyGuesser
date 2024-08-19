import Navbar from "~/app/_components/navbar";

export default async function Home() {


  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <Navbar />
      <div className="flex flex-grow flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Speedy<span className="text-[hsl(280,100%,70%)]">Guesser</span>
          </h1>
        </div>
      </div>
    </main>
  );
}

