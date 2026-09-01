# Piano d'esecuzione — SpeedyGuesser Revival (v1.0)

> **Scopo del documento**: piano autonomo e autoconsistente. Chi lo esegue non deve fare supposizioni: contesto, decisioni già prese con l'utente, file esatti, verifiche e criteri di fine lavoro sono tutti qui. Le decisioni sono **già approvate dall'utente** — non vanno riproposte come domande.
> Data: 2026-09-01 · Repo: `C:\Users\lboa\Desktop\SpeedyGuesser` (branch `cleanup`, working tree pulita)

---

## 0. Contesto e problema (cosa trovi, perché intervenire)

Progetto T3 App (Next 15, tRPC v11, Prisma 6 + SQLite, next-auth **v4**, Tailwind v4, shadcn) basato sul round "speedy" di *Reazione a Catena*: 2 Hinter danno indizi a voce, 1 Guesser indovina. Esistono solo modalità **offline** e **single**. Il multiplayer fu tentato 2 volte (local + online) con tRPC subscriptions + wsLink e **rimosso interamente** nell'ultimo commit `9b0dad5` perché:

1. **I route handler di Next.js non gestiscono l'upgrade WebSocket** → le subscription non potevano funzionare senza custom server
2. Il client tRPC apriva un WebSocket (`wsLink` in `src/trpc/react.tsx`) **in parallelo all'HTTP normale** → è la "connessione sovrapposta" ricordata dall'utente
3. L'`EventEmitter` in-process non funziona su hosting serverless (istanze multiple senza memoria condivisa)

**Bug confermati da analisi** (tutti da fixare, percorsi esatti):

| # | Bug | File:riga |
|---|-----|-----------|
| B1 | `getGameWords` fa `where: { id: gameId }` invece di `{ gameId }` → lista parole in `/stats` sempre vuota | `src/server/api/routers/game.ts:179` |
| B2 | `params` sincrono (Next 15 vuole `Promise<{gameId}>`) → pagina stats irraggiungibile | `src/app/stats/[gameId]/page.tsx:9` |
| B3 | Redirect a `/auth/signin` **inesistente** | `src/app/game/single/[gameId]/page.tsx:13`, `src/app/stats/[gameId]/page.tsx:13` |
| B4 | `updateGameResults` senza transazione/upsert → doppioni a re-run | `src/server/api/routers/game.ts:100-158` |
| B5 | Mutation dentro `useEffect` senza guard → rischio doppio salvataggio fine partita | `src/app/game/single/[gameId]/GameClient.tsx:67-77` |
| B6 | 3 procedure `*GameState` **pubbliche senza auth**: chiunque scrive lo stato di qualsiasi partita (dead code, ma esposto) | `src/server/api/routers/game.ts:221-334` |
| B7 | `findUnique({ where: { id: gameId }})` su GameState (id non è gameId) | `game.ts:230,302` |
| B8 | Typo cosmetici `text-3x` (home), `w/full` (footer) | `src/app/page.tsx:14`, `src/app/_components/footer.tsx:24` |

**Dead code residuo da rimuovere**: `wsLink`/`createWSClient` in `src/trpc/react.tsx:7,16-18,57-62`; modello `GameState` in `prisma/schema.prisma` (i modelli `Room`/`RoomPlayer` NON si eliminano: si riforgiano in Fase 4); tipo `RoomWithPlayers` in `src/types/game.ts:16-18`; regex `/game/local/*` e `/game/online/*` in `src/app/_components/footer.tsx:14-16`; `next-pwa` + `@types/next-pwa` (mai configurato); `web-push` + `@types/web-push`; `generate-vapid-keys.js`; `public/sw.js` (mai registrato); VAPID obbligatorie in `src/env.js:29-30` (**bloccano il build**); wrapper `src/app/_components/profileContext.tsx` (inutile); migrazione vuota `prisma/migrations/20250729143651_add_room_expiration/`.

**Da CONSERVARE**: `input-otp` (serve per il join-by-code), `src/app/manifest.ts` (PWA installabile voluta dall'utente), tutta la grafica (arancio `#ff7800`, font Jost, varianti `personal*` di `src/components/ui/button.tsx`, `SelectionForm`, `StatsComponent`).

---

## 1. Decisioni approvate (NON rinegoziare, sono state già chieste all'utente)

1. **Hosting: Netlify** + **Realtime: SSE + HTTP** (no WebSocket). Server→client via SSE endpoint per stanza; client→server via normali mutation tRPC. Upgrade path: se SSE non basta, sostituire l'hook client con Pusher — il DB e i router non cambiano.
2. **DB: Turso (libSQL)** anche in dev — un solo DB, free tier sovradimensionato. Prisma `provider = "libsql"` + `@prisma/adapter-libsql`.
3. **Multiplayer fedele al gioco TV**: link invito + codice 4 cifre come backup; lobby con **scelta ruolo + bottone Pronto** (2 HINTER + 1 GUESSER); **solo gli Hinter vedono la parola**; il Guesser preme ✅/pass/❌; timer sincronizzato via `startedAt` timestamp server (countdown calcolato client-side).
4. **Stats online valgono a tutti e 3** (guesser + 2 hinter), con compagni visibili nel profilo.
5. **PWA**: tenere `manifest.ts`, **buttare tutte le notifiche push**.
6. **Upgrade aggressivo**: ecosistema al latest stabile + **next-auth v4 → v5 (Auth.js)**.
7. **Un solo `GameBoard`** condiviso (era Todo README: "modulare la pagina del gioco").
8. **Docs**: `AGENTS.md`, `ARCHITECTURE.md`, `DESIGN.md` + spec in `docs/superpowers/specs/`. Test: **Vitest minimo** su logica critica.
9. **Stile grafico**: intoccabile nelle scelte estetiche; polish solo responsive/stati di connessione (skill `impeccable` in Fase 6).

---

## 2. Fasi (ordine obbligatorio — ogni fase chiude con verifica verde)

### FASE 0 — Spec document
1. Scrivi `docs/superpowers/specs/2026-09-01-speedyguesser-revival-design.md`: contesto (§0), decisioni (§1), architettura target, schema dati, flusso online, fasi. Self-review: zero TBD, zero contraddizioni, scope coerente.
2. Commit: `docs: add revival design spec`.

### FASE 1 — Pulizia + upgrade ecosistema + auth v5
**1a. Dead code (in quest'ordine, build verde dopo ogni gruppo):**

- `src/trpc/react.tsx`: rimuovi import `createWSClient`/`wsLink`, `WS_URL` (r.16-18) e il ramo subscription dello `splitLink` → resta solo `unstable_httpBatchStreamLink`
- Elimina file: `generate-vapid-keys.js`, `public/sw.js`, `src/app/_components/profileContext.tsx` (aggiorna `navbar.tsx` che lo importa — passa la session direttamente)
- `src/types/game.ts`: rimuovi `RoomWithPlayers` (tieni `StatsComponentProps`)
- `src/app/_components/footer.tsx`: rimuovi regex `local|online` (r.14-16)
- `src/env.js`: rimuovi `VAPID_*` (r.29-30 e mapping r.55)
- `package.json`: rimuovi `next-pwa`, `@types/next-pwa`, `web-push`, `@types/web-push` (+ `pnpm remove`)
- Fix typo B8

**1b. Upgrade deps (ordine: core → periferici):**

- `next` latest 15.x, `react`/`react-dom` **19** + `@types/react`/`@types/react-dom` 19 (le types nel progetto sono già 19 — incoerenza da sistemare), `@prisma/client`+`prisma` latest 6.x, `zod` 4, `@trpc/*` latest 11.x, `@tanstack/react-query` latest, `lucide-react` latest, `typescript` latest 5.x
- ⚠️ **Contingency zod 4**: se tRPC v11 in uso non supporta zod 4 (verifica con `pnpm why zod` + changelog tRPC), resta su zod 3 latest e nota in AGENTS.md. Non forzare.
- ⚠️ Radix/ui shadcn: porta i pacchetti `@radix-ui/*` all'ultimo (React 19 compat). Non toccare le classi/temi.
- Rimuovi `tailwindcss-animate` **solo se** `src/styles/globals.css` non lo referenzia (verifica con grep prima).

**1c. next-auth v5 (Auth.js) — la migrazione più delicata, isolata:**

- Installa `next-auth@beta` (o ultima 5.x stabile — verifica con `pnpm view next-auth version`)
- Rifai `src/server/auth.ts` → pattern v5: `authConfig` + `export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)`; provider Discord+Google (env auto-lette `AUTH_DISCORD_ID` ecc.); `PrismaAdapter(db)`; callbacks `session` inietta `user.id` (come ora, r.42-48); **mantieni l'augmentation TS** di `Session.user.id`
- `src/app/api/auth/[...nextauth]/route.ts`: `export const { GET, POST } = handlers`
- Sostituisci **tutti** i `getServerSession(authOptions)` con `await auth()` (cercali con grep: `src/server/api/trpc.ts` context, `src/app/game/single/*`, `src/app/stats/*`, navbar)
- `protectedProcedure`: legge la session dal context v5
- `src/env.js`: `AUTH_SECRET` (server), `AUTH_URL` opzionale; Netlify richiede `AUTH_TRUST_HOST=true`
- `.env.example` aggiornato di conseguenza (togli VAPID, NEXTAUTH_*, metti AUTH_*)
- ✅ **Verifica Fase 1**: `pnpm build` + `pnpm lint` verdi; smoke: login Discord/Google in dev, offline play completo, single play completo, logout. Se login rotto → stop e fix prima di proseguire.

### FASE 2 — GameBoard + bugfix offline/single
**2a. `src/app/_components/game/GameBoard.tsx`** (nuovo, cuore del refactor):

- Estrai la logica identica da `offline/play/page.tsx` (265 r.) e `single/[gameId]/GameClient.tsx` (244 r.): state `currentWordIndex, remainingTime, remainingPasses, wordRevealed, score, hasChosen, isProcessing, wordsData`
- API:

```ts
type GameConfig = { language: string; timeLimit: number; pass: number }
type WordResult = { word: string; status: "CORRECT" | "WRONG" | "PASSED" }
type GameResult = { score: number; passUsed: number; mistakes: number; words: WordResult[] }

<GameBoard
  words={Word[]}
  config={GameConfig}
  onFinish={(result: GameResult) => void}
  allowRestart?: boolean />   // solo offline true
```

- Logica pura estraibile in `src/lib/game-logic.ts` per i test: `applyVerdict(state, "CORRECT"|"WRONG"|"PASS") → newState`, `isRoundOver(state)`, `computeRemaining(startedAt, timeLimit, now)` — **niente side effects qui**
- Fix B5 qui: `onFinish` chiamato una sola volta con guard ref (`finishedRef.current`)
- **2b. Vista Hinter** (`HinterView`): mostra parola corrente + timer, zero bottoni — servirà a Fase 4; implementarla ora dentro GameBoard (render condizionato da prop `role?: "guesser" | "hinter"`, default guesser)

**2c. Adatta i due consumatori:**

- `offline/play/page.tsx`: ~20 righe, usa GameBoard con restart
- `single/[gameId]/GameClient.tsx`: usa GameBoard; `onFinish` → `updateGameResults.mutate()` poi `router.push(/stats/${gameId})` — **fuori dal useEffect**, dentro il callback di fine round

**2d. Bugfix server:**

- B1: `getGameWords` → `where: { gameId }`
- B2: `stats/[gameId]/page.tsx` → `params: Promise<{ gameId: string }>` + `await` (specchio di `single/[gameId]/page.tsx:7-9`)
- B3: redirect → `/api/auth/signin`
- B4: `updateGameResults` in `db.$transaction` con `upsert` su GameWord (`where: { gameId_order: { gameId, order } }` — c'è già l'unique composite)
- B6/B7: **elimina** le 3 procedure `*GameState` da `game.ts` + **drop table `GameState`** con `prisma migrate dev --name drop_game_state` (rimuovi anche relation da schema `Game.gameStates`)
- ✅ **Verifica Fase 2**: Vitest setup (`pnpm add -D vitest`, script `"test": "vitest run"`) + test di `applyVerdict`/`computeRemaining` (casi: pass esauriti, doppio verdict, tempo 0) passano; smoke offline (restart incluso) e single (salvataggio una sola volta, stats mostra lista parole — verifica B1/B2 risolti).

### FASE 3 — Turso + Netlify MVP
**3a. Turso (richiede interazione utente — guia e aspetta i valori):**

```bash
turso db create speedyguesser
turso db show speedyguesser --url        # → DATABASE_URL
turso db tokens create speedyguesser     # → DATABASE_AUTH_TOKEN
```

- `pnpm add @prisma/adapter-libsql libsql`
- `prisma/schema.prisma`: `datasource db { provider = "libsql", url = env("DATABASE_URL") }`
- `src/server/db.ts`: driver adapter

```ts
import { PrismaLibSQL } from "@prisma/adapter-libsql"

const adapter = new PrismaLibSQL({ url: env.DATABASE_URL, authToken: env.DATABASE_AUTH_TOKEN })
export const db = new PrismaClient({ adapter }) // NO accelerate, solo adapter
```

  (Pattern HMR singleton già presente va mantenuto.)
- Schema `url = env("DATABASE_URL")`: in dev punta al Turso remoto (deciso: un solo DB anche in dev — free tier enorme). Migrazioni: sul nuovo DB vuoto → `pnpm prisma migrate deploy` (le migration.sql esistenti sono SQL generico compatibile). Se attrito → fallback: `prisma db push` + baseline (`prisma migrate diff --from-empty --to-schema-datamodel --script > baseline.sql`) e seed. **Nota executor**: chiedi all'utente prima di toccare il suo account Turso.
- Seed: `pnpm prisma db seed` (232 parole IT/EN da `prisma/data/*.json`)

**3b. Netlify:**

- `netlify.toml`:

```toml
[build]
  command = "pnpm build"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

- Env su Netlify: `DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `AUTH_SECRET`, `AUTH_DISCORD_ID/SECRET`, `AUTH_GOOGLE_ID/SECRET`, `AUTH_TRUST_HOST=true`
- OAuth console (Discord/Google): aggiungi redirect URI `https://<netlify-domain>/api/auth/callback/{discord|google}` — **richiede azione manuale utente, chiedila al momento**
- ✅ **Verifica Fase 3**: deploy preview (o deploy manuale via `netlify deploy`) con login OAuth funzionante sul domain Netlify + offline/single giocabili da remoto.

### FASE 4 — Multiplayer online (feature mai finita)
**4a. Schema (migration `reforge_room_multiplayer`):**

```prisma
model Room {
  id         String     @id @default(cuid())
  code       Int        @unique            // 4 cifre (1000-9999), generato con retry su collisione
  hostUserId String
  host       User       @relation("RoomHost", fields: [hostUserId], references: [id])
  language   String
  timeLimit  Int
  pass       Int
  status     String     @default("WAITING") // WAITING | PLAYING | FINISHED | ABANDONED
  version    Int        @default(0)         // ++ a OGNI mutation → è l'intero protocollo SSE
  createdAt  DateTime   @default(now())
  players    RoomPlayer[]
  game       Game?
  @@index([status, createdAt])
}

model RoomPlayer {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  roomId     String
  room       Room     @relation(fields: [roomId], references: [id], onDelete: Cascade)
  role       String?  // "HINTER" | "GUESSER" | null
  isReady    Boolean  @default(false)
  lastSeenAt DateTime @default(now())     // presenza: online se now - lastSeenAt < 10s
  joinedAt   DateTime @default(now())
  @@unique([userId, roomId])
  @@index([roomId])
}
```

- `Game`: tiene `roomId @unique` già esistente; `user` = guesser per partite online (owner per single); `gameType: "ONLINE"`

**4b. `src/server/api/routers/room.ts`** — tutte `protectedProcedure`, check membro/host via helper `assertMember(roomId, userId)`:

| Procedura | Regole chiave |
|---|---|
| `createRoom({language,timeLimit,pass})` | genera codice 4 cifre univoco (retry loop su `findUnique({code})`), crea Room + RoomPlayer host, `version++` |
| `joinRoomByCode({code})` | room WAITING, <3 players, se già membro ritorna la room (idempotente, per il link invito); altrimenti crea RoomPlayer; `version++` |
| `setRole({roomId, role})` | GUESSER max 1, HINTER max 2 (count role attuali); cambio ruolo → `isReady=false`; `version++` |
| `setReady({roomId, isReady})` | toggle; `version++` |
| `startGame({roomId})` | **solo host**; valida: 2H+1G assegnati, tutti `isReady`; genera 50 parole random (estrai la query random di `getRandomWords` in helper riutilizzabile — nota: sostituire il loop a 1000 tentativi con shuffle in memoria delle 232 parole: banale e corretto); crea Game `status PLAYING, gameType ONLINE, startedAt null, score 0` + GameWord rows (order 0..49); room.status=PLAYING; `version++` |
| `startRound({roomId})` | **solo GUESSER**; imposta `Game.startedAt = now()` (il timer parte QUI, non all'avvio host) e rivela parola 0; `version++` |
| `submitAnswer({roomId, verdict})` | **solo GUESSER della room PLAYING con startedAt**; verdict ∈ CORRECT/WRONG/PASS; PASS richiede `passUsed < room.pass`; aggiorna Game (`score/mistakes/passUsed`) + GameWord status della parola corrente (già persistita — crash-safe) + avanza index; se `computeRemaining ≤ 0` → chiama stessa logica di finish; `version++` |
| `finishRound({roomId})` | timer scaduto o guesser finale: Game.status=FINISHED, `endedAt`, room.status=FINISHED; `version++` (parole già salvate progressivamente da submitAnswer) |
| `leaveRoom({roomId})` | elimina RoomPlayer; se room vuota o host esce e status WAITING → ABANDONED; `version++` |
| `getRoom({roomId})` | snapshot: room + players (con user nome/avatar, online=lastSeenAt<10s) + game + currentWordIndex — usato da lobby e round |

**Presenza e abbandono (niente cron)**: il loop SSE (4c) aggiorna `lastSeenAt` del richiedente ogni ~5s; ogni accesso a una room WAITING con nessun `lastSeenAt` recente da >60s → marca ABANDONED (lazy cleanup dentro `getRoom`/SSE start).

**4c. SSE endpoint `src/app/api/rooms/[roomId]/events/route.ts`:**

- GET: `await auth()` + check membership → altrimenti 401/403
- `ReadableStream`: loop `setInterval` ~300ms: leggi `Room` (con players+game+score) — se `version > lastSentVersion` → `controller.enqueue("data: <JSON snapshot>\n\n")`; ogni ~5s update `lastSeenAt` del richiedente; a ~55s → enqueue `event: reconnect` e `controller.close()` (EventSource del browser riconnette da solo)
- Snapshot JSON = payload di `getRoom` (riusa la stessa funzione di build snapshot — single source of truth)
- **Client hook `src/trpc/use-room-events.ts`**: `new EventSource(/api/rooms/${roomId}/events)` → on message → `queryClient.setQueryData(["room", roomId], snapshot)` (no refetch: il server pusha lo snapshot completo già pronto — più pigro e corretto di invalidation+refetch); on error/reconnect → stato `reconnecting` per la UI

**4d. Pagine (tutte sotto `/game/online`, stile esistente — riusa SelectionForm, buttons, dialog):**

- `src/app/game/online/page.tsx`: due azioni — **Crea stanza** (SelectionForm compattato → `createRoom` → redirect lobby) e **Entra con codice** (`input-otp` 4 cifre → `joinRoomByCode`)
- `src/app/game/online/join/[code]/page.tsx`: link invito → auth → `joinRoomByCode` → redirect lobby (se non loggato: redirect a `/api/auth/signin?callbackUrl=...`)
- `src/app/game/online/room/[roomId]/page.tsx`: **lobby live** — lista 3 slot con presenza online (grigio=offline), ognuno seleziona ruolo (bottoni HINTER/GUESSER, disabilitati se slot pieno) + **Pronto**; host vede **Avvia** solo quando 2H+1G tutti ready; se non pronto vede "in attesa…"
- `src/app/game/online/room/[roomId]/play/page.tsx`: dopo `startGame` → countdown 3-2-1 condiviso (calcolato da timestamp ricevuto via SSE) → guesser chiama `startRound` → **GuesserView**: GameBoard in modalità guesser con stato **esterno** (score/index da SSE — non riusa lo state interno del GameBoard: per online riusa solo i pezzi presentazionali `GameTimer`, `WordCard`, `ScoreBar` estratti da GameBoard) e i 3 bottoni chiamano `submitAnswer`; **HinterView**: parola corrente + timer, zero interazione
- Finale: room FINISHED → tutti redirect a stats (Fase 5 abilita l'accesso per i membri)
- ✅ **Verifica Fase 4**: test Vitest su helper room (`canStart`: 2H+1G ready; `nextCode` collision; `applyVerdict` già testato); smoke **3 tab browser** (2 finestre + 1 incognito con account diversi se possibile): create → join ×2 → ruoli → ready ×3 → avvia → countdown → round completo (correct/wrong/pass, pass esaurito) → timer 0 → tutti sul finale. Verifica riconnessione SSE: killa la connessione (devtools) e conferma re-sync.

### FASE 5 — Stats online
- `getUserLastGames`: `OR: [{ userId: me }, { room: { players: { some: { userId: me } } } }]` — include partite di squadra
- `getUserStatistics`: idem aggregate (giocate = own + room games; best score = max)
- `/stats/[gameId]` page: autorizzazione estesa — `game.user.id === me` **oppure** membro di `game.room.players`; UI stats mostra i compagni (da `RoomPlayer.user`) per partite online
- `profilePage.tsx`: decommenta il bottone "Dettagli" (r.49-58, ora fattibile)
- ✅ Verifica: smoke profilo con 1 single + 1 room game.

### FASE 6 — UI polish (skill `impeccable`)
- Responsive mobile: header (`navbar`), SelectionForm parametri, GameBoard bottoni — era Todo README r.8
- Stati SSE: "connessione…", "riconnessione…", giocatore offline in lobby, room abbandonata
- Empty states + microcopy coerenti con tono esistente (EN, come il resto dell'UI)
- README: rimuovi "Local Mode", descrivi Online, aggiorna install (Turso)
- ⚠️ Vincolo: **non cambiare** palette (`--color-main #ff7800` ecc. in `src/styles/globals.css`), font Jost, varianti bottoni — solo layout/UX

### FASE 7 — Docs finali + chiusura
- `AGENTS.md`: comandi (`pnpm dev/build/lint/test`, prisma, turso), convenzioni (tRPC router pattern, server-only boundary, zod input, protectedProcedure obbligatorio per dati utente), mappa aree (`src/app/game/*`, `src/server/api/routers/*`), regola "ogni mutation room fa `version++`", workflow git (commit piccoli, lint-staged già attivo con husky)
- `ARCHITECTURE.md`: stack, diagramma flusso SSE+mutation, schema DB, timer-by-timestamp, **upgrade path Pusher** (sostituire hook, DB invariato), perché NO WebSocket su serverless
- `DESIGN.md`: palette (main `#ff7800`, dark, second, third, light da `globals.css`), Jost, componenti shadcn custom (`personal*` variants), regole: niente nuovi colori senza tema, pattern Dialog+VisuallyHidden, tono microcopy EN
- Spec final review: confronta `docs/superpowers/specs/...` con ciò che è stato costruito, aggiorna deviazioni
- ✅ **Verifica finale globale**: `pnpm lint && pnpm build && pnpm test` verdi; grep zero-hit: `wsLink|VAPID|next-pwa|web-push|GameState` in `src/` + `next.config.js` + `package.json`; smoke completo end-to-end su deploy Netlify.

---

## 3. Env vars — stato finale

```env
DATABASE_URL="libsql://<db>.turso.io"
DATABASE_AUTH_TOKEN="<token>"
AUTH_SECRET="..."
AUTH_TRUST_HOST="true"        # solo su Netlify
AUTH_DISCORD_ID / AUTH_DISCORD_SECRET
AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET
# ELIMINATE: NEXTAUTH_*, VAPID_*
```

## 4. Rischi e contingenze (nota per l'executor)

1. **auth v5 è beta/instabile di versione**: pinnare la versione esatta installata e documentarla in AGENTS.md; se v5 da problemi bloccanti → fallback documentato: resta v4 patched e annota in spec (decisione da riferire all'utente, non silenziosa)
2. **zod 4 ↔ tRPC v11**: verificare compat; fallback zod 3 (annotare)
3. **Turso/Netlify/OAuth richiedono azioni utente** (account, CLI login, redirect URIs): chiedi i valori al momento, non inventare URL
4. **SSE su Netlify limit 60s**: la riconnessione è nativa del browser — NON implementare retry custom prima di verificare che quello nativo basta
5. **Non reintrodurre WebSocket**: qualunque proposta "socket.io sarebbe meglio" è fuori scope (deciso)
6. **Netlify + `next dev --turbopack`**: irrilevante in prod, ma se il build Netlify fallisce su turbopack flag usare `next build` standard

## 5. Criteri di DONE

✅ build/lint/test verdi · offline+single rifattorizzati su GameBoard senza duplicazione · stats raggiungibile con lista parole (B1/B2 chiusi) · zero procedure non autenticate sui dati utente · deploy Netlify con OAuth · partita online completa a 3 giocatori end-to-end su deploy · stats online a tutti e 3 · PWA installabile · docs (AGENTS/ARCHITECTURE/DESIGN + spec) presenti e coerenti col codice reale.
