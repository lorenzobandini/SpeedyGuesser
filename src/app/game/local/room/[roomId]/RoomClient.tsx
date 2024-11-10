"use client"

import { useParams, useRouter } from "next/navigation"
import type { Session } from "next-auth"
import { api } from "~/trpc/react"
import { Button } from "~/components/ui/button"
import Image from "next/image"
import { useEffect } from "react"

export default function RoomClient({ session }: { session: Session | null }) {
  const router = useRouter()
  const { roomId } = useParams()
  const validRoomId = Array.isArray(roomId) ? roomId[0] : roomId

  const { data: room, refetch } = api.game.getRoomById.useQuery(
    { roomId: validRoomId ?? "" },
    { refetchOnWindowFocus: false }
  )
  const createPlayer = api.game.joinRoom.useMutation()
  const updatePlayerRole = api.game.updatePlayerRole.useMutation()

  useEffect(() => {
    if (!session) {
      router.push("/api/auth/signin")
    }
  }, [session, router])

  useEffect(() => {
    if (session && validRoomId) {
      createPlayer.mutate({ roomId: validRoomId, role: "GUESSER" })
    }
  }, [session, validRoomId])

  const handleRoleChange = (role: "HINTER" | "GUESSER") => {
    if (session && validRoomId) {
      updatePlayerRole.mutate({ roomId: validRoomId, role })
      void refetch()
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      void refetch()
    }, 3000)

    return () => clearInterval(interval)
  }, [refetch])

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
              <li key={player.user.id} className="flex items-center space-x-2">
                <Image src={player.user.image ?? "/default-profile.png"} alt={`${player.user.name}'s profile`} className="w-8 h-8 rounded-full" width={32} height={32} />
                <span>{player.user.name} - {player.role}</span>
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