# SpeedyGuesser Revival — Design Spec (v1.0)

> Data: 2026-09-01 · Repo: `C:\Users\lboa\Desktop\SpeedyGuesser` (branch `cleanup`)
> Piano d'esecuzione: `docs/plans/2026-09-01-speedyguesser-revival.md`
> Status decisioni: **approvate dall'utente** — questo documento è la fonte di verità architetturale per l'esecuzione.

---

## 1. Contesto

T3 App (Next 15, tRPC v11, Prisma 6 + SQLite, next-auth v4, Tailwind v4, shadcn) che replica il round "speedy" di *Reazione a Catena*: 2 Hinter danno indizi a voce, 1 Guesser indovina. Esistono solo modalità **offline** (stesso dispositivo) e **single** (1 giocatore). Il multiplayer fu tentato 2 volte (local + online) con tRPC subscriptions + wsLink e rimosso interamente in `9b0dad5` perché:

1. I route handler di Next.js non gestiscono l'upgrade WebSocket → subscription impossibili senza custom server.
2. Il client tRPC apriva un WebSocket in parallelo all'HTTP → la "connessione sovrapposta".
3. `EventEmitter` in-process non funziona su serverless (istanze senza memoria condivisa).

Bug confermati da analisi:

| # | Bug | Dove |
|---|-----|------|
| B1 | `getGameWords` filtra `where: { id: gameId }` invece di `{ gameId }` → lista parole in `/stats` sempre vuota | `src/server/api/routers/game.ts:179` |
| B2 | `params` sincrono (Next 15 richiede `Promise<{gameId}>`) → pagina stats irraggiungibile | `src/app/stats/[gameId]/page.tsx:9` |
| B3 | Redirect a `/auth/signin` inesistente | `src/app/game/single/[gameId]/page.tsx:13`, `src/app/stats/[gameId]/page.tsx:13` |
| B4 | `updateGameResults` senza transazione/upsert → doppioni a re-run | `src/server/api/routers/game.ts:100-158` |
| B5 | Mutation dentro `useEffect` senza guard → rischio doppio salvataggio fine partita | `src/app/game/single/[gameId]/GameClient.tsx:67-77` |
| B6 | 3 procedure `*GameState` pubbliche senza auth: chiunque scrive lo stato di qualsiasi partita (dead code esposto) | `src/server/api/routers/game.ts:221-334` |
| B7 | `findUnique({ where: { id: gameId }})` su GameState (id ≠ gameId) | `game.ts:230,302` |
| B8 | Typo `text-3x` (home), `w/full` (footer) | `src/app/page.tsx:14`, `src/app/_components/footer.tsx:24` |

Da eliminare (dead code): `wsLink`/`createWSClient` in `src/trpc/react.tsx`, modello `GameState`, tipo `RoomWithPlayers`, regex `/game/local/*` e `/game/online/*` nel footer, `next-pwa` + `@types/next-pwa` (mai configurato), `web-push` + `@types/web-push`, `generate-vapid-keys.js`, `public/sw.js` (mai registrato), VAPID obbligatorie in `src/env.js` (bloccano il build), wrapper `profileContext.tsx`, migrazione vuota `20250729143651_add_room_expiration`.

Da conservare: `input-otp` (join-by-code), `src/app/manifest.ts` (PWA installabile), tutta la grafica (arancio `#ff7800`, font Jost, varianti `personal*` di `button.tsx`, `SelectionForm`, `StatsComponent`).

## 2. Decisioni approvate

1. **Hosting: Netlify** + **Realtime: SSE + HTTP** (no WebSocket). Server→client via SSE endpoint per stanza; client→server via mutation tRPC. Upgrade path: se SSE non basta, sostituire l'hook client con Pusher — DB e router invariati.
2. **DB: Turso (libSQL)** anche in dev — un solo DB. Prisma `provider = "libsql"` + `@prisma/adapter-libsql`.
3. **Multiplayer fedele al gioco TV**: link invito + codice 4 cifre (1000-9999) come backup; lobby con scelta ruolo + bottone Pronto (2 HINTER + 1 GUESSER); solo gli Hinter vedono la parola; il Guesser preme ✅/pass/❌; timer sincronizzato via `startedAt` timestamp server (countdown client-side).
4. **Stats online valgono a tutti e 3** (guesser + 2 hinter), compagni visibili nel profilo.
5. **PWA**: tenere `manifest.ts`, buttare tutte le notifiche push.
6. **Upgrade aggressivo**: ecosistema al latest stabile + next-auth v4 → v5 (Auth.js).
7. **Un solo `GameBoard`** condiviso tra offline e single.
8. **Docs**: `AGENTS.md`, `ARCHITECTURE.md`, `DESIGN.md` + questa spec. Test: **Vitest minimo** su logica critica.
9. **Stile grafico intoccabile**; polish solo responsive/stati di connessione.

## 3. Architettura target

```
Browser (3 client)
  │  mutation tRPC (HTTP POST /api/trpc)        client→server: azioni
  │  EventSource GET /api/rooms/[roomId]/events server→client: snapshot push
  ▼
Next.js route handlers su Netlify (@netlify/plugin-nextjs)
  │
  ├─ tRPC v11: gameRouter (offline/single) + roomRouter (multiplayer)
  ├─ SSE route: poll DB ~300ms, push snapshot quando Room.version cambia,
  │             refresh lastSeenAt ~5s, close a ~55s (EventSource riconnette nativo)
  └─ Auth.js v5: Discord + Google, PrismaAdapter, session.user.id
  ▼
Prisma 6 + adapter-libsql → Turso (libSQL) — unico DB dev e prod
```

Principi chiave:

- **`Room.version` è l'intero protocollo SSE**: ogni mutation incrementa; il loop SSE confronta `version > lastSentVersion` e pusha lo snapshot completo. Nessun diff, nessun canale granulare.
- **Timer by timestamp**: `Game.startedAt` impostato dal server al primo avvio round (solo il GUESSER lo attiva); il countdown è calcolato client-side da `startedAt + timeLimit`. Nessun timer server.
- **Persistenza progressiva**: ogni `submitAnswer` scrive subito Game (score/mistakes/passUsed) e GameWord della parola corrente → crash-safe, nessun flush finale.
- **Presenza senza cron**: il loop SSE aggiorna `lastSeenAt` del richiedente ogni ~5s; ogni accesso a room WAITING con nessun `lastSeenAt` recente da >60s → ABANDONED (lazy cleanup in `getRoom`/SSE start).
- **Niente WebSocket**: fuori scope, deciso. Qualunque alternativa passa dall'upgrade path Pusher.

## 4. Schema dati target

```prisma
model Room {
  id         String     @id @default(cuid())
  code       Int        @unique            // 4 cifre (1000-9999), retry su collisione
  hostUserId String
  host       User       @relation("RoomHost", fields: [hostUserId], references: [id])
  language   String
  timeLimit  Int
  pass       Int
  status     String     @default("WAITING") // WAITING | PLAYING | FINISHED | ABANDONED
  version    Int        @default(0)         // ++ a OGNI mutation → protocollo SSE
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
  lastSeenAt DateTime @default(now())     // online se now - lastSeenAt < 10s
  joinedAt   DateTime @default(now())
  @@unique([userId, roomId])
  @@index([roomId])
}
```

- `Room.gameType` eliminato (ridondante: `Game.gameType` basta). `Room.updatedAt` rimosso (version lo sostituisce).
- `GameState` eliminato (B6/B7): tabella drop con migration, relation `Game.gameStates` rimossa.
- `Game`: `roomId @unique` già esistente; per partite online `user` = guesser (owner per single); `gameType: "ONLINE"`; `startedAt` nullabile? No — resta `@default(now())` ma per online viene **sovrascritto al primo `startRound`** (il guesser avvia il timer). GameWord rows (order 0..49) create alla `startGame`, status `PENDING`, aggiornate progressivamente.

Flusso ruoli: GUESSER max 1, HINTER max 2. Cambio ruolo → `isReady=false`. `startGame` (solo host) valida 2H+1G assegnati e tutti ready. `startRound` (solo GUESSER) imposta `startedAt`. `submitAnswer` (solo GUESSER di room PLAYING con startedAt): CORRECT→score+1, WRONG→score-1 (min 0), PASS→passUsed+1 (max room.pass); ogni verdict marca GameWord corrente e avanza index; `computeRemaining ≤ 0` → finish. `finishRound`: Game FINISHED + `endedAt`, room FINISHED. `leaveRoom`: elimina RoomPlayer; room vuota o host esce in WAITING → ABANDONED.

## 5. Flusso online (end-to-end)

1. **Crea**: `/game/online` → SelectionForm compattato → `createRoom` → redirect `/game/online/room/[roomId]`.
2. **Join**: link invito `/game/online/join/[code]` (auth con callbackUrl) oppure input-otp 4 cifre → `joinRoomByCode` (idempotente se già membro) → lobby.
3. **Lobby** (`/game/online/room/[roomId]`): 3 slot con presenza (grigio=offline, `lastSeenAt` <10s), ognuno seleziona ruolo + Pronto; host vede "Avvia" solo con 2H+1G tutti ready. Aggiornamenti via SSE → `queryClient.setQueryData(["room", roomId], snapshot)`.
4. **Round** (`/game/online/room/[roomId]/play`): countdown 3-2-1 condiviso (timestamp via SSE) → guesser chiama `startRound` → GUESSER vede solo il GameBoard presentazionale (GameTimer, WordCard, ScoreBar) con 3 bottoni → `submitAnswer`; HINTER vede parola corrente + timer, zero interazione. Stato autorevole dal server via SSE.
5. **Fine**: room FINISHED → tutti redirect a `/stats/[gameId]` (Fase 5 estende l'accesso ai membri).

Snapshot JSON (single source of truth, builder condiviso tra `getRoom` e SSE): room config/status/version + players (nome, avatar, role, isReady, online) + game (id, status, score, passUsed, mistakes, currentWordIndex, parola corrente **solo se richiedente è HINTER** o parola già assegnata) + timer (startedAt).

## 6. Fasi di esecuzione (ordine obbligatorio, verifica verde a chiusura di ognuna)

| Fase | Contenuto | Verifica |
|------|-----------|----------|
| 0 | Questa spec + commit | self-review: zero TBD, zero contraddizioni |
| 1 | Dead code (WS, VAPID, PWA push, profileContext, typo) → upgrade deps (next 15 latest, react 19, prisma 6 latest, zod 4 se compatibile tRPC v11, tRPC 11 latest, radix latest) → **auth v5** (Auth.js: `auth()` + `handlers`, env `AUTH_*`, `.env.example`) | `pnpm build` + `pnpm lint` verdi; smoke login/logout + offline + single |
| 2 | `GameBoard.tsx` (state interno, prop `role`, `allowRestart`, `onFinish` con guard ref B5) + `src/lib/game-logic.ts` puro (`applyVerdict`, `isRoundOver`, `computeRemaining`) + Hinterview + refit dei 2 consumatori + bugfix B1 (where gameId), B2 (await params), B3 (`/api/auth/signin`), B4 (transaction+upsert), B6/B7 (drop procedures + drop table GameState) | Vitest (`applyVerdict`/`computeRemaining`: pass esauriti, doppio verdict, tempo 0) + smoke offline (restart) e single (salvataggio 1 volta, lista parole in stats) |
| 3 | Turso (db create, DATABASE_URL/TOKEN, adapter-libsql, migrate deploy, seed) + Netlify (netlify.toml, env, OAuth redirect URIs — azione utente) | deploy con login OAuth + offline/single remoti |
| 4 | Schema Room/RoomPlayer reforge (migration `reforge_room_multiplayer`) + `roomRouter` (createRoom, joinRoomByCode, setRole, setReady, startGame, startRound, submitAnswer, finishRound, leaveRoom, getRoom) + SSE route + `use-room-events.ts` + 4 pagine online | Vitest (canStart, nextCode collision) + smoke 3 tab end-to-end + riconnessione SSE |
| 5 | Stats online: query `getUserLastGames`/`getUserStatistics` estese alle room, auth `/stats/[gameId]` estesa ai membri, UI compagni, bottone "Dettagli" in profilePage | smoke profilo con 1 single + 1 room game |
| 6 | UI polish (responsive navbar/SelectionForm/GameBoard, stati SSE, empty states, README) — palette/font/bottoni intoccabili | ispezione visiva mobile+desktop |
| 7 | Docs finali (AGENTS.md, ARCHITECTURE.md, DESIGN.md) + spec review deviazioni | `pnpm lint && pnpm build && pnpm test` + grep zero-hit (`wsLink|VAPID|next-pwa|web-push|GameState`) + smoke end-to-end su deploy |

## 7. Env vars finali

```env
DATABASE_URL="libsql://<db>.turso.io"
DATABASE_AUTH_TOKEN="<token>"
AUTH_SECRET="..."
AUTH_TRUST_HOST="true"        # solo su Netlify
AUTH_DISCORD_ID / AUTH_DISCORD_SECRET
AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET
# ELIMINATE: NEXTAUTH_*, VAPID_*
```

## 8. Rischi

1. **Auth v5 beta**: pinnare la versione esatta; fallback documentato → resta v4 patched, decisione riferita all'utente (non silenziosa).
2. **Zod 4 ↔ tRPC v11**: verificare compat (`pnpm why zod`); fallback zod 3 latest, annotare in AGENTS.md.
3. **Turso/Netlify/OAuth richiedono azioni utente**: chiedere i valori al momento, non inventare URL.
4. **SSE su Netlify 60s**: riconnessione nativa del browser; nessun retry custom prima di verificare che basti.
5. **Turbopack su Netlify**: se il build fallisce, `next build` standard.

## 9. Criteri di DONE

Build/lint/test verdi · offline+single su GameBoard condiviso senza duplicazione · stats raggiungibile con lista parole (B1/B2 chiusi) · zero procedure non autenticate sui dati utente · deploy Netlify con OAuth · partita online completa a 3 giocatori end-to-end · stats online a tutti e 3 · PWA installabile · docs coerenti col codice reale.
