/*
  Warnings:

  - A unique constraint covering the columns `[userId,roomId]` on the table `RoomPlayer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "RoomPlayer_roomId_userId_key";

-- CreateTable
CREATE TABLE "GameState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gameId" TEXT NOT NULL,
    "actualTime" INTEGER NOT NULL,
    "actualScore" INTEGER NOT NULL,
    "actualPass" INTEGER NOT NULL,
    "actualIndexWord" INTEGER NOT NULL,
    "actualStatus" TEXT NOT NULL,
    "isTimerRunning" BOOLEAN NOT NULL,
    CONSTRAINT "GameState_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "GameState_gameId_key" ON "GameState"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomPlayer_userId_roomId_key" ON "RoomPlayer"("userId", "roomId");
