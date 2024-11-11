/*
  Warnings:

  - You are about to alter the column `code` on the `Room` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Room" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" INTEGER NOT NULL,
    "gameType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING',
    "language" TEXT NOT NULL,
    "timeLimit" INTEGER NOT NULL,
    "pass" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Room" ("code", "createdAt", "gameType", "id", "language", "pass", "status", "timeLimit", "updatedAt") SELECT "code", "createdAt", "gameType", "id", "language", "pass", "status", "timeLimit", "updatedAt" FROM "Room";
DROP TABLE "Room";
ALTER TABLE "new_Room" RENAME TO "Room";
CREATE UNIQUE INDEX "Room_code_key" ON "Room"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
