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
  const searchGameFromRoom = api.room.searchGameFromRoom.useQuery({ roomId: validRoomId }, { enabled: false })
  const [selectedRole, setSelectedRole] = useState<"HINTER" | "GUESSER">("GUESSER")

  const createGame = api.room.createGameFromRoom.useMutation({
    onSuccess: (data) => {
      router.push(`/game/local/${data.gameId}`);
    },
    onError: (error) => {
      console.error("Failed to create game:", error);
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
    if (room?.status == "READY") {
      console.log("room", room)
      void searchGameFromRoom.refetch().then(() => {
        if (searchGameFromRoom.data) {
          router.push(`/game/local/${searchGameFromRoom.data.gameId}`);
        }
      });
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
      const currentPlayer = room?.players.find(p => p.user.id === session.user.id);
      if (!currentPlayer) {
        setCreatedPlayer(false);
      }
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
    <div className="flex items-center justify-center ">
      <div className="rounded-lg w-full max-w-md">
        
        {room ? (
          <div className="space-y-2">
            <h1 className="text-3xl text-center text-dark font-semibold">Room Code: {room.code}</h1>
            <p className="text-lg text-center text-dark">Players: {room.players.length}/3</p>
            
            <div className="space-y-4">
                {room.players.map((player) => (
                <div key={player.user.id} className="rounded-lg p-4 flex items-center space-x-4 border-2 border-dark">
                  <Image 
                  src={player.user.image ?? "/default-profile.png"} 
                  alt={`${player.user.name}'s profile`} 
                  className="w-12 h-12 rounded-full border-2 border-second" 
                  width={48} 
                  height={48} 
                  />
                  <div>
                  <p className="font-semibold text-dark">{player.user.name}</p>
                  <p className="text-sm text-dark">{player.role}</p>
                  </div>
                </div>
                ))}
              
              {room.players.length < 3 && (
                <div className="border-2 border-dashed border-second rounded-lg p-4 flex items-center justify-center h-[76px]">
                  <p className="text-second">Waiting...</p>
                </div>
              )}
              
              {room.players.length < 2 && (
                <div className="border-2 border-dashed border-second rounded-lg p-4 flex items-center justify-center h-[76px]">
                  <p className="text-second">Waiting...</p>
                </div>
              )}
              {room.players.length < 1 && (
                <div className="border-2 border-dashed border-second rounded-lg p-4 flex items-center justify-center h-[76px]">
                  <p className="text-second">Waiting...</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="personal" 
                onClick={() => handleRoleChange("HINTER")}
              >
                Become Hinter
              </Button>
              <Button 
                variant="personal" 
                onClick={() => handleRoleChange("GUESSER")}
              >
                Become Guesser
              </Button>
            </div>
            
            <div className="mt-6">
              <Button 
                variant="personal" 
                className="w-full bg-third hover:bg-lime-400 text-white"
                onClick={() => createGame.mutate({ roomId: validRoomId })} 
                disabled={!canCreateGame}
              >
                Create Game
              </Button>
              {!canCreateGame && (
                <p className="text-dark mt-2 text-center text-sm">
                  The game can only be created when there are 3 players: 2 Hinters and 1 Guesser.
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-lg text-center text-dark">Loading room information...</p>
        )}
      </div>
    </div>
  )
}