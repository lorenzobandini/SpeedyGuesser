# **SpeedyGuesser** ⚡

> _"Sfida i tuoi amici e scopri chi è il più veloce a indovinare! Una gara di intuizione e velocità."_  

---

## **Indice** 📚

- [**SpeedyGuesser** ⚡](#speedyguesser-)
  - [**Indice** 📚](#indice-)
  - [**Descrizione del Progetto**](#descrizione-del-progetto)
  - [**Come Si Usa** 🛠️](#come-si-usa-️)
  - [**Modalità di Gioco** 🎮](#modalità-di-gioco-)
    - [**Modalità Offline**](#modalità-offline)
    - [**Modalità Singola**](#modalità-singola)
    - [**Modalità Locale**](#modalità-locale)
  - [**Tecnologie Utilizzate** 🧰](#tecnologie-utilizzate-)
  - [**Contributi** 🤝](#contributi-)
  - [**Licenza** 📜](#licenza-)

---

## **Descrizione del Progetto**

**SpeedyGuesser** è un gioco coinvolgente in cui due squadre competono per indovinare il maggior numero di parole nel minor tempo possibile.  
Il progetto è basato su **[Create T3 App](https://create.t3.gg/)**, che garantisce un'architettura scalabile e moderna per le applicazioni web.

- **Versione attuale**: 1.0.0
- **Sviluppatore**: Lorenzo Bandini  
  📧 Email: [bandinilorenzo02@gmail.com](mailto:bandinilorenzo02@gmail.com)

---

## **Come Si Usa** 🛠️

_Fornisci i seguenti passaggi per installare e avviare il progetto localmente._

1. Clona il repository:

   ```bash
   git clone https://github.com/lorenzobandini/speedyguesser.git
   ```

2. Accedi alla cartella del progetto:

   ```bash
   cd speedyguesser
   ```

3. Copia il file `.env.example` e personalizza il tuo `.env`:

   ```bash
   cp .env.example .env
   ```

4. Installa le dipendenze:

   ```bash
   pnpm install
   ```

5. Sincronizza il prisma schema con il database:

   ```bash
   npx prisma db push
   ```

6. Popola il database con i dati iniziali:

   ```bash
   npx prisma db seed
   ```

7. Avvia l'app in modalità di sviluppo:

   ```bash
   pnpm run dev
   ```

8. (Facoltativo) Apri Prisma Studio per gestire il database:

   ```bash
   npx prisma studio
   ```

**Nota**: SpeedyGuesser è una **Progressive Web App (PWA)** e può essere installata sul tuo dispositivo per un'esperienza nativa.

---

## **Modalità di Gioco** 🎮

SpeedyGuesser offre tre modalità di gioco per adattarsi a ogni situazione:

### **Modalità Offline**

- Nessuna autenticazione richiesta.
- Gioca su un singolo dispositivo.
- I risultati non vengono salvati.

### **Modalità Singola**

- Richiede l'autenticazione.
- Simile alla modalità offline, ma i risultati vengono salvati.

### **Modalità Locale**

- Richiede l'autenticazione.
- Permette di giocare su più dispositivi sincronizzati in tempo reale.
- Ogni giocatore può scegliere il proprio ruolo e i risultati vengono salvati.

---

## **Tecnologie Utilizzate** 🧰

**SpeedyGuesser** è stato costruito utilizzando un insieme di tecnologie moderne e performanti:

- **TypeScript**: Per un codice più sicuro e leggibile.
- **Next.js**: Framework React per creare applicazioni web server-rendered.
- **Tailwind CSS**: Per un design rapido e responsivo.
- **Prisma**: ORM per interagire con il database in modo semplice.
- **tRPC**: Per API type-safe tra il client e il server.
- **PWA**: Supporta installazione e le notifiche.

---

## **Contributi** 🤝

Vuoi contribuire?  
Segui questi semplici passaggi:

1. Fai un fork del progetto.
2. Crea un branch per le modifiche:

   ```bash
   git checkout -b feature/nuova-funzionalità
   ```

3. Effettua il commit delle modifiche:

   ```bash
   git commit -m "Aggiunta della nuova funzionalità"
   ```

4. Invia una pull request!

---

## **Licenza** 📜

Questo progetto è distribuito sotto la licenza **MIT**.  
Consulta il file [LICENSE](./LICENSE) per ulteriori dettagli.
