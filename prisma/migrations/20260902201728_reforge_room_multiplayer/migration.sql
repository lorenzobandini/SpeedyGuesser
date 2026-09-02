-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" INTEGER NOT NULL,
    "hostUserId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    "pass" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Room_hostUserId_fkey" FOREIGN KEY ("hostUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Room" ("code", "createdAt", "id", "language", "pass", "status", "timeLimit") SELECT "code", "createdAt", "id", "language", "pass", "status", "timeLimit" FROM "Room";
DROP TABLE "Room";
ALTER TABLE "new_Room" RENAME TO "Room";
CREATE UNIQUE INDEX "Room_code_key" ON "Room"("code");
CREATE INDEX "Room_status_createdAt_idx" ON "Room"("status", "createdAt");
CREATE TABLE "new_RoomPlayer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "role" TEXT,
    "isReady" BOOLEAN NOT NULL DEFAULT false,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RoomPlayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RoomPlayer_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RoomPlayer" ("id", "joinedAt", "role", "roomId", "userId") SELECT "id", "joinedAt", "role", "roomId", "userId" FROM "RoomPlayer";
DROP TABLE "RoomPlayer";
ALTER TABLE "new_RoomPlayer" RENAME TO "RoomPlayer";
CREATE INDEX "RoomPlayer_roomId_idx" ON "RoomPlayer"("roomId");
CREATE UNIQUE INDEX "RoomPlayer_userId_roomId_key" ON "RoomPlayer"("userId", "roomId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
