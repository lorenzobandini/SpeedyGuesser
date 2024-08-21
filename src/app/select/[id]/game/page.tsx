export default async function Home({ params }: { params: { id: string } }) {
  return (
    <div className="flex min-h-screen flex-col bg-main text-light">
      <div className="flex flex-grow flex-col items-center justify-center">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">  
          You are on the game page with id: {params.id}
        </h1>
      </div>
    </div>
  );
}
