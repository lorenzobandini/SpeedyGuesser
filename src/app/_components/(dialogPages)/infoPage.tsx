import { ScrollArea } from "~/components/ui/scroll-area";

export default function InfoPage() {
  return (
    <div className="flex flex-col items-center justify-center text-dark">
      <div className="flex w-full max-w-md flex-col rounded-lg bg-light p-8 shadow-lg">
        <h1 className="mb-4 text-center text-2xl font-bold">Informazioni</h1>
        <ScrollArea className="mb-6 max-h-64 w-full overflow-auto rounded-md border p-4">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Come Funziona il Gioco</h2>
            <p>
              Il gioco coinvolge due giocatori che, a turno, forniscono una
              parola per far indovinare a una terza persona la parola
              visualizzata sullo schermo. Solitamente si gioca contro un altro
              gruppo di persone e vince chi, nello stesso lasso di tempo, riesce
              a indovinare il maggior numero di parole.
            </p>
            <h3 className="text-lg font-medium">Modalità Offline</h3>
            <p>
              Accessibile senza bisogno di effettuare l&apos;accesso. Si gioca
              su un singolo dispositivo e le partite non vengono salvate.
            </p>
            <h3 className="text-lg font-medium">Modalità Singola</h3>
            <p>
              Simile alla modalità offline, con la differenza che è necessario
              essere autenticati. I risultati vengono salvati.
            </p>
            <h3 className="text-lg font-medium">Modalità Locale</h3>
            <p>
              Accessibile solo agli utenti autenticati. Permette a più giocatori
              su diversi dispositivi di unirsi alla partita e scegliere il
              proprio ruolo. Lo stato della partita viene sincronizzato in tempo
              reale sui vari dispositivi e i risultati vengono salvati.
            </p>
          </div>
        </ScrollArea>
        <div className="grid flex-grow grid-cols-1 gap-6">
          <div>
            <h3 className="text-lg font-semibold">Sviluppatore</h3>
            <p className="text-gray-600">Lorenzo Bandini</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Email</h3>
            <p className="text-gray-600">bandinilorenzo02@gmail.com</p>
          </div>
        </div>
        <div className="mt-6 text-center text-sm text-gray-400">
          Versione: 1.0.0
        </div>
      </div>
    </div>
  );
}
