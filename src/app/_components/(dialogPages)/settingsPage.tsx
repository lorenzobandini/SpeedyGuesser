export default function SettingsPage() {
  return (
    <div className="text-dark flex flex-col items-center justify-center">
      <div className="bg-light w-full max-w-md rounded-lg p-8 shadow-lg">
        <h1 className="mt-4 text-center text-2xl font-bold">Impostazioni</h1>
        <div className="mt-6 grid grid-cols-2 gap-10">
          <div>
            <h3 className="text-lg font-semibold">Lingua</h3>
            <p className="text-gray-600">Italiano</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Tema</h3>
            <p className="text-gray-600">Scuro</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Notifiche</h3>
            <p className="text-gray-600">Abilitate</p>
          </div>
        </div>
      </div>
    </div>
  );
}
