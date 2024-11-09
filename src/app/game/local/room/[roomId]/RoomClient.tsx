"use client"

import { useParams, useRouter } from "next/navigation"
import type { Session } from "next-auth"
import { api } from "~/trpc/react"
import { Button } from "~/components/ui/button"

export default function RoomClient({ session }: { session: Session | null }) {
  const router = useRouter()
  const { roomId } = useParams()
  const validRoomId = Array.isArray(roomId) ? roomId[0] : roomId

  const { data: room, refetch } = api.game.getRoomById.useQuery({ roomId: validRoomId ?? "" })
  const updatePlayerRole = api.game.updatePlayerRole.useMutation()

  if (!session) {
    router.push("/api/auth/signin")
    return null
  }

  const handleRoleChange = (role: "HINTER" | "GUESSER") => {
    if (session && validRoomId) {
      updatePlayerRole.mutate({ roomId: validRoomId, role })
      void refetch()
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Room</h1>
      <p className="text-lg mb-4">Room ID: {roomId}</p>
      {room ? (
        <div className="space-y-4">
          <p className="text-lg">Codice della Stanza: {room.code}</p>
          <p className="text-lg">Numero di Giocatori: {room.players.length}</p>
          <ul className="space-y-2">
            {room.players.map((player) => (
              <li key={player.user.id} className="bg-gray-100 p-2 rounded">
                {player.user.name} - {player.role}
              </li>
            ))}
          </ul>
          <div className="flex space-x-4">
            <Button variant="personal" onClick={() => handleRoleChange("HINTER")}>Diventa Hinter</Button>
            <Button variant="personal" onClick={() => handleRoleChange("GUESSER")}>Diventa Guesser</Button>
          </div>
        </div>
      ) : (
        <p className="text-lg">Loading room information...</p>
      )}
      <p className="text-lg mt-4">Session: {session ? session.user.name : "No session"}</p>
    </div>
  )
}