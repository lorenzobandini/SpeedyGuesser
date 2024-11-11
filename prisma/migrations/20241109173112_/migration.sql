/*
  Warnings:

  - A unique constraint covering the columns `[roomId,userId]` on the table `RoomPlayer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "RoomPlayer_roomId_userId_role_key";

-- CreateIndex
CREATE UNIQUE INDEX "RoomPlayer_roomId_userId_key" ON "RoomPlayer"("roomId", "userId");
