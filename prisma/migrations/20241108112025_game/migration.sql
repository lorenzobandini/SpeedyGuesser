/*
  Warnings:

  - Added the required column `gameType` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `language` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pass` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `timeLimit` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" TEXT,
    "userId" TEXT,
    "score" INTEGER NOT NULL DEFAULT 0,
    "language" TEXT NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    "pass" INTEGER NOT NULL,
    "passUsed" INTEGER NOT NULL DEFAULT 0,
    "mistakes" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "gameType" TEXT NOT NULL,
    CONSTRAINT "Game_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Game_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Game" ("endedAt", "id", "roomId", "score", "startedAt") SELECT "endedAt", "id", "roomId", "score", "startedAt" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
CREATE UNIQUE INDEX "Game_roomId_key" ON "Game"("roomId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
