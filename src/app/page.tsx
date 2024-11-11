import { Button } from '~/components/ui/button';
import Link from 'next/link';
  

export default function Home() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-grow flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Speedy<span className="text-dark">Guesser</span>
          </h1>
          <Link href="game/">
            <Button variant="personal" size="xl">
              <div className="text-3x">Play</div>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

