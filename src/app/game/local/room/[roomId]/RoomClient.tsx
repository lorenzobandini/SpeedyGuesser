"use client"

import { useParams, useRouter } from "next/navigation"
import type { Session } from "next-auth"
import { api } from "~/trpc/react"
import { Button } from "~/components/ui/button"
import Image from "next/image"
import { useEffect, useState } from "react"


export default function RoomClient({ session }: { session: Session | null }) {
  const router = useRouter()
  const params = useParams<Record<string, string | string[]>>()
  const roomId = params?.roomId
  const validRoomId = typeof roomId === "string" ? roomId : roomId?.[0] ?? ""
  const [ createdPlayer, setCreatedPlayer ] = useState(false)

  const { data: room, refetch } = api.room.getRoomById.useQuery(
    { roomId: validRoomId ?? "" },
    { refetchOnWindowFocus: false }
  )
  const createPlayer = api.room.joinRoom.useMutation()
  const updatePlayerRole = api.room.updatePlayerRole.useMutation()
  const leaveRoom = api.room.leaveRoom.useMutation()
  const [selectedRole, setSelectedRole] = useState<"HINTER" | "GUESSER">("GUESSER")

  const createGame = api.room.createGameFromRoom.useMutation({
    onSuccess: (data) => {
      router.push(`/game/local/${data.gameId}`);
    },
    onError: (error) => {
      // Handle error, e.g., show a notification
    },
  });

  const canCreateGame =
    room &&
    room.players.length === 3 &&
    room.players.filter(p => p.role === "HINTER").length === 2 &&
    room.players.filter(p => p.role === "GUESSER").length === 1;

  useEffect(() => {
    if (!session) {
      router.push("/api/auth/signin")
    }
  }, [session, router])

  useEffect(() => {
    if (session && room && !createdPlayer) {
      if (room.players.length < 3 && validRoomId) {
        createPlayer.mutate({ roomId: validRoomId, role: selectedRole })
        setCreatedPlayer(true)
      } else {
        router.push("/game")
      }
    }
  }, [session, validRoomId, room])

  useEffect(() => {
    return () => {
      if (session && validRoomId) {
        leaveRoom.mutate({ roomId: validRoomId })
      }
    }
  }, [session, validRoomId])

  const handleRoleChange = (role: "HINTER" | "GUESSER") => {
    if (session && validRoomId) {
      setSelectedRole(role)
      updatePlayerRole.mutate({ roomId: validRoomId, role })
      void refetch()
    }
  }

  
  useEffect(() => {
    if (room && session) {
      const currentPlayer = room.players.find(p => p.user.id === session.user.id);
      if (currentPlayer) {
        if (currentPlayer.role === "HINTER" || currentPlayer.role === "GUESSER") {
          setSelectedRole(currentPlayer.role);
        }
      }
    }
  }, [room, session]);

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
          <p className="text-lg">Numero di Giocatori: {room.players.length}/3</p>
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
      {room && (
        <div className="mt-4">
          <Button
            variant="personal"
            onClick={() => createGame.mutate({ roomId: validRoomId })}
            disabled={!canCreateGame}
          >
            Crea Partita
          </Button>
          {!canCreateGame && (
            <p className="text-red-500 mt-2">
              La partita può essere creata solo quando ci sono 3 giocatori: 2 Hinter e 1 Guesser.
            </p>
          )}
        </div>
      )}
      <p className="text-lg mt-4">Session: {session ? session.user.name : "No session"}</p>
    </div>
  )
}