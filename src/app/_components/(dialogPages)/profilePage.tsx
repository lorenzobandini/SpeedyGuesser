import { getServerAuthSession } from "~/server/auth";
import Image from "next/image";

export default async function ProfilePage() {
    const session = await getServerAuthSession();
    const userName = session?.user?.name;
    const userImage = session?.user?.image;
  
    return (
      <div className="flex flex-col items-center justify-center  text-dark">
        <div className="bg-light shadow-lg rounded-lg p-8 w-full max-w-md">
          <div className="flex items-center justify-center">
            {userImage && (
              <Image
                src={userImage}
                alt="User Image"
                width={100}
                height={100}
                className="rounded-full"
              />
            )}
          </div>
          <h1 className="text-2xl font-bold mt-4 text-center">{userName}</h1>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <h3 className="text-lg font-semibold">Record Punteggio</h3>
              <p className="text-gray-600">1234</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Partite Giocate</h3>
              <p className="text-gray-600">50</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Posizione in Classifica</h3>
              <p className="text-gray-600">12</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Miglior Compagno</h3>
              <p className="text-gray-600">Player X</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Numero di Amici</h3>
              <p className="text-gray-600">25</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Ultimo Accesso</h3>
              <p className="text-gray-600">2 giorni fa</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Media Punteggio</h3>
              <p className="text-gray-600">800</p>
            </div>
          </div>
        </div>
      </div>
    );
}