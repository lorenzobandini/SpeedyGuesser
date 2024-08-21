export default function InfoPage() {
  return (
    <div className="flex flex-col items-center justify-center text-dark">
      <div className="w-full max-w-md rounded-lg bg-light p-8 shadow-lg">
        <h1 className="mt-4 text-center text-2xl font-bold">Informazioni</h1>
        <div className="mt-6 grid grid-cols-2 gap-10 ">
          <div>
            <h3 className="text-lg font-semibold">Versione</h3>
            <p className="text-gray-600">1.0.0</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Sviluppatore</h3>
            <p className="text-gray-600">Lorenzo Bandini</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Email</h3>
            <p className="text-gray-600">bandinilorenzo02@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
