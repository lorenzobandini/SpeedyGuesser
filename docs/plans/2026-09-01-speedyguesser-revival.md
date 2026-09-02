# Piano d'esecuzione — SpeedyGuesser Revival (v1.2 — ripresa)

> **Scopo del documento**: piano di ripresa per una nuova chat. Le Fasi 0-3 sono **completate e verificate** (sezione Stato); restano le Fasi 4-7. Il documento è autoconsistente: contesto, decisioni approvate, file esatti, verifiche e criteri di fine lavoro sono tutti qui.
> Spec di design (fonte di verità architetturale): `docs/superpowers/specs/2026-09-01-speedyguesser-revival-design.md`
> Data: 2026-09-01 · Repo: `C:\Users\lboa\Desktop\SpeedyGuesser` (branch `main`, deploy Netlify attivo)

---

## 0. Riepilogo di ciò che è stato fatto (Fasi 0-2, committato)

| Commit | Contenuto |
|--------|-----------|
| `5ae906a` | **F0** — Spec design `docs/superpowers/specs/2026-09-01-speedyguesser-revival-design.md` |
| `5fc1018` | **F0** — Piano d'esecuzione originale (poi sostituito da questo v1.1) |
| `3a48121` | **F1a** — Dead code: rimosso wsLink/createWSClient da `src/trpc/react.tsx`, `generate-vapid-keys.js`, `public/sw.js`, `profileContext.tsx` (navbar ora passa la session direttamente), `RoomWithPlayers`, regex local/online nel footer, VAPID da `src/env.js`, pacchetti `next-pwa`/`web-push`/types, typo B8. Fix B2 (`params: Promise` in stats page), fix build blocker `await headers()` in `src/trpc/server.ts`, Suspense wrapper per `useSearchParams` in offline/play (−3187 righe) |
| `d243c46` | **F1b** — Upgrade: next 15.5.25, react/react-dom 19.2.8, @prisma/client+prisma 6.19.3, zod **4.5.4** (compatibile con tRPC 11.18.0, nessun problema riscontrato), @trpc/* 11.18.0, @tanstack/react-query 5.102.8, typescript 5.9.3, @typescript-eslint 8.69.0, eslint-config-next 15.5.25, radix latest, @auth/prisma-adapter 2.11.3, lucide-react, superjson, input-otp, react-icons. Rimosso `tailwindcss-animate` (mai referenziato in `src/`) |
| `5399fbe` | **F1c** — **next-auth v5 (Auth.js)**: `next-auth@5.0.0-beta.32` (pinnata esatta — v5 ancora in beta). `src/server/auth.ts` rifatto: `NextAuthConfig` + `export const { handlers, auth, signIn, signOut }`, provider Discord/Google con env `AUTH_*`, PrismaAdapter, `trustHost: true`, session callback inietta `user.id`, augmentation `Session.user.id` mantenuta. `route.ts` → `export const { GET, POST } = handlers`. Tutti i `getServerSession` → `await auth()` (trpc context, navbar, logButton, game pages, stats page). Fix **B3** (redirect `/api/auth/signin`). `src/env.js` → `AUTH_SECRET`/`AUTH_DISCORD_ID/SECRET`/`AUTH_GOOGLE_ID/SECRET`. `.env` e `.env.example` aggiornati (NEXTAUTH_*/VAPID eliminate) |
| `b362609` | **F2** — `src/lib/game-logic.ts` (pura: `applyVerdict`, `advanceWord`, `isRoundOver`, `computeRemaining`, `initRound`, `toResult`; Verdict = `CORRECT|WRONG|PASSED`) + `src/app/_components/game/GameBoard.tsx` (state interno, prop `role: guesser|hinter`, guard `finishedRef` → **B5 chiuso**, named exports `GameTimer`/`WordCard`/`ScoreBar` per la Fase 4) + rifit `offline/play/page.tsx` (~70 r., restart via key remount + refetch) e `GameClient.tsx` (~40 r., `onFinish` → mutation → redirect stats, fuori dal useEffect). Fix **B1** (`where: { gameId }`), **B4** (`$transaction` + upsert su `gameId_order`, input `outcome` ora `z.enum(['CORRECT','WRONG','PASSED'])`). **B6/B7 chiusi**: eliminate le 3 procedure `*GameState`, rimosso modello `GameState` + relation `Game.gameStates`, migration `20260901150556_drop_game_state` applicata, rimossa la migrazione vuota `20250729143651_add_room_expiration`. Vitest setup (`vitest.config.ts`, script `pnpm test`) + 11 test su game-logic |

**Verifiche passate**: `pnpm lint` ✅ · `pnpm tsc --noEmit` ✅ · `pnpm test` (11/11) ✅ · `pnpm build` ✅ · login Discord funzionante su dev ✅ · smoke offline (gioco + restart) ✅ · smoke single (salvataggio 1× + stats con lista parole = B1/B2 chiusi) ✅

| Commit | Contenuto |
|--------|-----------|
| `8ea5b9b` | **F3a** — Turso (libSQL) via driver adapter: `@prisma/adapter-libsql@6.19.3` + `libsql@0.5.10`, `prisma/schema.prisma` resta `provider = "sqlite"` con `url` hardcoded `file:./db.sqlite` (ignorata a runtime), `src/server/db.ts` con `PrismaLibSQL`, `src/env.js` aggiunge `DATABASE_AUTH_TOKEN`, `prisma/seed.ts` con adapter. DB Turso `speedyguesser` creato, 7 migration applicate, seed 232 parole. `next.config.js`: `serverExternalPackages: ['libsql', '@libsql/client', '@prisma/adapter-libsql']` (build falliva senza). `.gitignore` + `db`/`db-wal` |
| `5cec8e7` | **F3a fix** — `prisma.config.ts` (⚠️ non previsto dal piano v1.1, vedi deviazioni): `engine: 'js'` + adapter per `migrate deploy`/`db seed` direttamente su Turso; carica `.env` solo se presente (fix build Netlify CI) |
| `0c0e6b6` | **F3b** — Netlify: sito `speedyguesser` linkato al repo GitHub (`main` = branch di deploy), env vars impostate via `netlify env:import .env` + `AUTH_TRUST_HOST=true`. Deploy git-based verde: **https://speedyguesser.netlify.app** — login OAuth Discord/Google funzionante su dominio Netlify ✅ |

**Verifiche Fase 3 passate**: lint/tsc/test/build locali ✅ · migration+seed su Turso ✅ · dev server smoke (home + /api/auth/signin 200) ✅ · deploy Netlify `ready` + OAuth login OK (verificato utente) ✅

### Deviazioni dal piano v1.1 per la Fase 3 (da riportare in spec in Fase 7)
1. **`provider = "libsql"` NON esiste in Prisma 6.19** (P1012): si usa `provider = "sqlite"` + driver adapter `PrismaLibSQL` (GA). La `url` nello schema è `file:./db.sqlite` hardcoded e serve solo alla validazione CLI; la connessione reale (libsql://) arriva dall'adapter.
2. **`prisma.config.ts`** (nuovo file): `engine: 'js'` + `adapter` (+ `experimental.adapter`) per applicare migration/seed direttamente a Turso dal CLI 6.x; `migrations.seed` spostato qui (rimosso blocco `package.json#prisma` deprecato). Carica `.env` con `process.loadEnvFile()` **solo se esiste** — altrimenti rompe il postinstall su CI.
3. **Deploy Netlify git-based** (non `netlify deploy --build` locale: fallisce su Windows per EPERM symlink nello standalone output). Branch di deploy: `main` (fast-forwardato su `cleanup`).
4. Turso CLI su Windows: installata in **WSL Ubuntu** (`~/.turso/turso`, no binario Windows per turso-cli 1.x). Le migration sono già tutte applicate: future migration = `pnpm exec prisma migrate dev` (locale, genera SQL) poi `pnpm exec prisma migrate deploy` (applica a Turso via adapter).

### Note ambiente (per chi riprende)
- **Deploy**: push su `main` → build automatica Netlify. `netlify watch` per aspettare; stato via API (config token in `%APPDATA%\netlify\Config\config.json`).
- **Porta 3000**: container Docker `jevibet-app-1`/`jevibet-postgres-1` fermati con `--restart=no`. Riattivare: `docker start jevibet-app-1 jevibet-postgres-1`.
- **Dev server**: `pnpm dev` su `http://localhost:3000`.
- **Windows + Prisma**: `prisma generate` fallisce con EPERM (DLL lock) se il dev server è attivo → fermare il server, rigenerare, riavviare.
- **pnpm `add pkg@major` non aggiorna il lockfile** se il range esistente già soddisfa: pinnare la versione esatta (`pnpm add pkg@x.y.z`).
- `next lint` deprecato (warning a ogni run) — migrare a ESLint CLI in Fase 7 se si vuole.
- `.env`: `DATABASE_URL="libsql://speedyguesser-lorenzobandini.aws-eu-west-1.turso.io"` + `DATABASE_AUTH_TOKEN` + `AUTH_*` (Discord/Google).

### Deviazioni dal piano v1.0 Fasi 0-2 (da riportare in spec in Fase 7)
1. **GameBoard senza prop `allowRestart`**: il restart offline avviene via remount (`key={restartKey}`) + `StatsComponent` renderizzato dal parent — stessa capacità, meno codice.
2. **`GameWord.status` / outcome migrati a costanti EN** (`CORRECT`/`WRONG`/`PASSED`) ovunque (prima erano stringhe IT libere).
3. `src/trpc/server.ts`: `headers()` ora è async (`await headers()`) — fix build blocker pre-esistente.
4. `getRandomWords` mantiene ancora il loop a 1000 tentativi — l'estrazione helper + shuffle è rimandata a Fase 4 come da piano.

---

## 1. Decisioni approvate (NON rinegoziare)

1. **Hosting: Netlify** + **Realtime: SSE + HTTP** (no WebSocket). Server→client via SSE endpoint per stanza; client→server via normali mutation tRPC. Upgrade path: se SSE non basta, sostituire l'hook client con Pusher — il DB e i router non cambiano.
2. **DB: Turso (libSQL)** anche in dev — un solo DB, free tier sovradimensionato. Prisma `provider = "libsql"` + `@prisma/adapter-libsql`.
3. **Multiplayer fedele al gioco TV**: link invito + codice 4 cifre come backup; lobby con **scelta ruolo + bottone Pronto** (2 HINTER + 1 GUESSER); **solo gli Hinter vedono la parola**; il Guesser preme ✅/pass/❌; timer sincronizzato via `startedAt` timestamp server (countdown calcolato client-side).
4. **Stats online valgono a tutti e 3** (guesser + 2 hinter), con compagni visibili nel profilo.
5. **PWA**: tenere `manifest.ts`, **zero notifiche push** (già rimosse).
6. **Auth v5 fatto** (next-auth@5.0.0-beta.32, pinnata — documentare in AGENTS.md).
7. **Un solo `GameBoard` condiviso** ✅ fatto.
8. **Docs**: `AGENTS.md`, `ARCHITECTURE.md`, `DESIGN.md` + spec in `docs/superpowers/specs/`. Test: Vitest ✅ (estendere con i test room in Fase 4).
9. **Stile grafico intoccabile**; polish solo responsive/stati di connessione (skill `impeccable` in Fase 6).

---

## 2. Fasi rimanenti (ordine obbligatorio — ogni fase chiude con verifica verde)

### FASE 3 — Turso + Netlify MVP ✅ COMPLETATA (committata: 8ea5b9b, 0c0e6b6, 5cec8e7 — vedi tabella e deviazioni §0)
> Eseguita con le deviazioni elencate sopra. Outcome: DB Turso con schema+seed, deploy Netlify git-based su `main`, OAuth Discord/Google funzionanti su dominio Netlify.
**3a. Turso (chiedi all'utente prima di toccare il suo account):**

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

  (Pattern HMR singleton già presente in `src/server/db.ts` va mantenuto.)
- Schema `url = env("DATABASE_URL")` → in dev punta al Turso remoto (deciso: un solo DB anche in dev). Sul DB vuoto → `pnpm prisma migrate deploy` (le migration.sql esistenti sono SQL generico compatibile). Se attrito → fallback `prisma db push` + baseline (`prisma migrate diff --from-empty --to-schema-datamodel --script > baseline.sql`) e seed.
- ⚠️ `src/env.js`: `DATABASE_URL: z.string().url()` — verificare che `libsql://...` passi la validazione (dovrebbe: è un URL valido). Aggiungere `DATABASE_AUTH_TOKEN: z.string()` al server schema + runtimeEnv + `.env.example`.
- Seed: `pnpm prisma db seed` (232 parole IT/EN da `prisma/data/*.json`).

**3b. Netlify:**

```toml
[build]
  command = "pnpm build"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

- `netlify.toml` come sopra (+ `pnpm add -D @netlify/plugin-nextjs`).
- Env su Netlify: `DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `AUTH_SECRET`, `AUTH_DISCORD_ID/SECRET`, `AUTH_GOOGLE_ID/SECRET`, `AUTH_TRUST_HOST=true`
- OAuth console (Discord/Google): aggiungere redirect URI `https://<netlify-domain>/api/auth/callback/{discord|google}` — **azione manuale utente, chiedere al momento, non inventare URL**.
- ✅ **Verifica Fase 3**: deploy preview (o `netlify deploy`) con login OAuth funzionante sul domain Netlify + offline/single giocabili da remoto.

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

- Stato attuale schema: `Room` ha già `code`, `gameType`, `status`, players, game — va riforgiato (rimuovere `gameType`, `updatedAt`; aggiungere `hostUserId/host`, `version`, `@@index`); `RoomPlayer` ha già `role`/`userId`/`roomId` — aggiungere `isReady`, `lastSeenAt`, `onDelete: Cascade`, index.
- `Game`: tiene `roomId @unique` già esistente; per online `user` = guesser (owner per single); `gameType: "ONLINE"`.
- ⚠️ Su Turso: `prisma migrate dev` dopo lo switch — oppure `prisma migrate diff` per generare lo SQL e `migrate deploy`.

**4b. `src/server/api/routers/room.ts`** — tutte `protectedProcedure`, check membro/host via helper `assertMember(roomId, userId)`:

| Procedura | Regole chiave |
|---|---|
| `createRoom({language,timeLimit,pass})` | genera codice 4 cifre univoco (retry loop su `findUnique({code})`), crea Room + RoomPlayer host, `version++` |
| `joinRoomByCode({code})` | room WAITING, <3 players, se già membro ritorna la room (idempotente, per il link invito); altrimenti crea RoomPlayer; `version++` |
| `setRole({roomId, role})` | GUESSER max 1, HINTER max 2 (count role attuali); cambio ruolo → `isReady=false`; `version++` |
| `setReady({roomId, isReady})` | toggle; `version++` |
| `startGame({roomId})` | **solo host**; valida: 2H+1G assegnati, tutti `isReady`; genera 50 parole random (estrai la query random di `getRandomWords` in helper riutilizzabile — sostituire il loop a 1000 tentativi con shuffle in memoria delle 232 parole: banale e corretto); crea Game `status PLAYING, gameType ONLINE, startedAt now, score 0` + GameWord rows (order 0..49); room.status=PLAYING; `version++` |
| `startRound({roomId})` | **solo GUESSER**; imposta `Game.startedAt = now()` (il timer parte QUI, non all'avvio host) e rivela parola 0; `version++` |
| `submitAnswer({roomId, verdict})` | **solo GUESSER della room PLAYING con startedAt**; verdict ∈ CORRECT/WRONG/PASSED; PASSED richiede `passUsed < room.pass`; aggiorna Game (`score/mistakes/passUsed`) + GameWord status della parola corrente (già persistita — crash-safe) + avanza index; se `computeRemaining ≤ 0` → chiama stessa logica di finish; `version++` |
| `finishRound({roomId})` | timer scaduto o guesser finale: Game.status=FINISHED, `endedAt`, room.status=FINISHED; `version++` (parole già salvate progressivamente da submitAnswer) |
| `leaveRoom({roomId})` | elimina RoomPlayer; se room vuota o host esce e status WAITING → ABANDONED; `version++` |
| `getRoom({roomId})` | snapshot: room + players (con user nome/avatar, online=lastSeenAt<10s) + game + currentWordIndex — usato da lobby e round |

**Presenza e abbandono (niente cron)**: il loop SSE (4c) aggiorna `lastSeenAt` del richiedente ogni ~5s; ogni accesso a una room WAITING con nessun `lastSeenAt` recente da >60s → ABANDONED (lazy cleanup dentro `getRoom`/SSE start).

**4c. SSE endpoint `src/app/api/rooms/[roomId]/events/route.ts`:**

- GET: `await auth()` + check membership → altrimenti 401/403
- `ReadableStream`: loop `setInterval` ~300ms: leggi `Room` (con players+game+score) — se `version > lastSentVersion` → `controller.enqueue("data: <JSON snapshot>\n\n")`; ogni ~5s update `lastSeenAt` del richiedente; a ~55s → enqueue `event: reconnect` e `controller.close()` (EventSource del browser riconnette da solo)
- Snapshot JSON = payload di `getRoom` (riusa la stessa funzione di build snapshot — single source of truth)
- **Client hook `src/trpc/use-room-events.ts`**: `new EventSource(/api/rooms/${roomId}/events)` → on message → `queryClient.setQueryData(["room", roomId], snapshot)` (no refetch: il server pusha lo snapshot completo già pronto — più pigro e corretto di invalidation+refetch); on error/reconnect → stato `reconnecting` per la UI
- ⚠️ Route handler Next: `export const dynamic = 'force-dynamic'` e headers `Content-Type: text/event-stream`, `Cache-Control: no-cache, no-transform`, `Connection: keep-alive`.

**4d. Pagine (tutte sotto `/game/online`, stile esistente — riusa SelectionForm, buttons, dialog, GameTimer/WordCard/ScoreBar da `GameBoard.tsx`):**

- `src/app/game/online/page.tsx`: due azioni — **Crea stanza** (SelectionForm compattato → `createRoom` → redirect lobby) e **Entra con codice** (`input-otp` 4 cifre → `joinRoomByCode`)
- `src/app/game/online/join/[code]/page.tsx`: link invito → auth → `joinRoomByCode` → redirect lobby (se non loggato: redirect a `/api/auth/signin?callbackUrl=...`)
- `src/app/game/online/room/[roomId]/page.tsx`: **lobby live** — lista 3 slot con presenza online (grigio=offline), ognuno seleziona ruolo (bottoni HINTER/GUESSER, disabilitati se slot pieno) + **Pronto**; host vede **Avvia** solo quando 2H+1G tutti ready; se non pronto vede "in attesa…"
- `src/app/game/online/room/[roomId]/play/page.tsx`: dopo `startGame` → countdown 3-2-1 condiviso (calcolato da timestamp ricevuto via SSE) → guesser chiama `startRound` → **GuesserView**: usa solo i pezzi presentazionali `GameTimer`, `WordCard`, `ScoreBar` (stato esterno: score/index da SSE) con 3 bottoni che chiamano `submitAnswer`; **HinterView**: `role="hinter"` del GameBoard (parola corrente + timer, zero interazione)
- Finale: room FINISHED → tutti redirect a stats (Fase 5 abilita l'accesso per i membri)
- ✅ **Verifica Fase 4**: test Vitest su helper room (`canStart`: 2H+1G ready; `nextCode` collision; `applyVerdict` già testato); smoke **3 tab browser**: create → join ×2 → ruoli → ready ×3 → avvia → countdown → round completo (correct/wrong/pass, pass esaurito) → timer 0 → tutti sul finale. Verifica riconnessione SSE: killa la connessione (devtools) e conferma re-sync.

### FASE 5 — Stats online
- `getUserLastGames`: `OR: [{ userId: me }, { room: { players: { some: { userId: me } } } }]` — include partite di squadra
- `getUserStatistics`: idem aggregate (giocate = own + room games; best score = max)
- `/stats/[gameId]` page: autorizzazione estesa — `game.user.id === me` **oppure** membro di `game.room.players`; UI stats mostra i compagni (da `RoomPlayer.user`) per partite online
- `profilePage.tsx`: decommenta il bottone "Dettagli" (r.49-58)
- ✅ Verifica: smoke profilo con 1 single + 1 room game.

### FASE 6 — UI polish (skill `impeccable`)
- Responsive mobile: header (`navbar`), SelectionForm parametri, GameBoard bottoni — era Todo README r.8
- Stati SSE: "connessione…", "riconnessione…", giocatore offline in lobby, room abbandonata
- Empty states + microcopy coerenti con tono esistente (EN, come il resto dell'UI)
- README: rimuovi "Local Mode", descrivi Online, aggiorna install (Turso)
- ⚠️ Vincolo: **non cambiare** palette (`--color-main #ff7800` ecc. in `src/styles/globals.css`), font Jost, varianti bottoni — solo layout/UX

### FASE 7 — Docs finali + chiusura
- `AGENTS.md`: comandi (`pnpm dev/build/lint/test`, prisma, turso), convenzioni (tRPC router pattern, server-only boundary, zod input, protectedProcedure obbligatorio per dati utente), mappa aree (`src/app/game/*`, `src/server/api/routers/*`), regola "ogni mutation room fa `version++`", workflow git (commit piccoli, lint-staged già attivo con husky), **pinni attuali**: next-auth@5.0.0-beta.32, zod 4 OK con tRPC 11.18
- `ARCHITECTURE.md`: stack, diagramma flusso SSE+mutation, schema DB, timer-by-timestamp, **upgrade path Pusher** (sostituire hook, DB invariato), perché NO WebSocket su serverless
- `DESIGN.md`: palette (main `#ff7800`, dark, second, third, light da `globals.css`), Jost, componenti shadcn custom (`personal*` variants), regole: niente nuovi colori senza tema, pattern Dialog+VisuallyHidden, tono microcopy EN
- Spec final review: confronta `docs/superpowers/specs/2026-09-01-speedyguesser-revival-design.md` con ciò che è stato costruito, aggiorna **le 4 deviazioni elencate in §0**
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
# GIÀ ELIMINATE: NEXTAUTH_*, VAPID_*
```

## 4. Rischi e contingenze (nota per l'executor)

1. **auth v5 beta pinnata** a `5.0.0-beta.32` — funziona (verificato con login Discord). Se aggiornarla, testare login prima di commit.
2. **zod 4 ↔ tRPC v11**: compatibilità verificata in F1b (nessun problema). Non tornare a zod 3.
3. **Turso/Netlify/OAuth richiedono azioni utente**: chiedi i valori al momento, non inventare URL.
4. **SSE su Netlify limit 60s**: la riconnessione è nativa del browser — NON implementare retry custom prima di verificare che quello nativo basta.
5. **Non reintrodurre WebSocket**: fuori scope (deciso).
6. **Netlify + turbopack**: se il build Netlify fallisce sul flag, usare `next build` standard.
7. **Windows/Prisma**: `prisma generate` con dev server attivo → EPERM (DLL lock). Fermare server → generate → riavviare.

## 5. Criteri di DONE

✅ build/lint/test verdi · offline+single rifattorizzati su GameBoard senza duplicazione *(fatto)* · stats raggiungibile con lista parole (B1/B2 chiusi) *(fatto)* · zero procedure non autenticate sui dati utente *(fatto)* · **deploy Netlify con OAuth · partita online completa a 3 giocatori end-to-end su deploy · stats online a tutti e 3 · PWA installabile · docs (AGENTS/ARCHITECTURE/DESIGN + spec) presenti e coerenti col codice reale.**
