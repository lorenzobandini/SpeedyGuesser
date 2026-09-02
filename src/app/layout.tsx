import '~/styles/globals.css';
import { Jost as FontSans } from 'next/font/google';
import { TRPCReactProvider } from '~/trpc/react';
import { cn } from '~/lib/utils';
import Navbar from '~/app/_components/navbar';
import Footer from '~/app/_components/footer';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'SpeedyGuesser',
  description:
    'Game to be played by three people where two people have to make the third person guess as many words as possible by saying one word each',
  icons: [{ rel: 'icon', url: '/SpeedyGuesserLogo-LittleRounded.ico' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fontSans.variable} h-full`}>
      <body
        className={cn(
          'bg-main text-light flex h-full max-h-screen flex-col overflow-hidden font-sans antialiased',
          fontSans.variable,
        )}
      >
        <TRPCReactProvider>
          <Navbar />
          <main className="flex grow flex-col overflow-y-auto">{children}</main>
          <Footer />
        </TRPCReactProvider>
      </body>
    </html>
  );
}
