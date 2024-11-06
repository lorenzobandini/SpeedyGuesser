'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "~/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "~/components/ui/select"

export default function SpeedGuess() {
  const router = useRouter()
  const [language, setLanguage] = useState('IT')
  const [time, setTime] = useState('60')
  const [passes, setPasses] = useState('3')

  const handleStartGame = () => {
    router.push(`/game/offline/play?language=${language}&time=${time}&passes=${passes}`)
  }

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex flex-grow flex-col items-center justify-center px-4">
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          <span className="text-light">Speedy</span>
          <span className="text-dark">Guesser</span>
        </h1>

        <div className="grid w-full max-w-md grid-cols-2 gap-4 text-xl sm:text-2xl lg:text-3xl">
          <div className="flex items-center justify-start pr-4 font-bold">
            Language
          </div>
          <div className="flex justify-end">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="flex h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 items-center justify-around rounded-xl border-2 border-dashed border-dark bg-second font-mono text-xl sm:text-2xl lg:text-3xl font-medium text-dark">
                <SelectValue placeholder="IT" />
              </SelectTrigger>
              <SelectContent className="border-dashed border-dark bg-second font-mono text-dark">
                <SelectGroup>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="EN">EN</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-start pr-4 font-bold">
            Time
          </div>
          <div className="flex justify-end">
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger className="flex h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 items-center justify-around rounded-xl border-2 border-dashed border-dark bg-second font-mono text-xl sm:text-2xl lg:text-3xl font-medium text-dark">
                <SelectValue placeholder="60" />
              </SelectTrigger>
              <SelectContent className="border-dashed border-dark bg-second font-mono text-dark">
                <SelectGroup>
                  <SelectItem value="45">45</SelectItem>
                  <SelectItem value="60">60</SelectItem>
                  <SelectItem value="90">90</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-start pr-4 font-bold">
            Passes
          </div>
          <div className="flex justify-end">
            <Select value={passes} onValueChange={setPasses}>
              <SelectTrigger className="flex h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 items-center justify-around rounded-xl border-2 border-dashed border-dark bg-second font-mono text-xl sm:text-2xl lg:text-3xl font-medium text-dark">
                <SelectValue placeholder="3" />
              </SelectTrigger>
              <SelectContent className="border-dashed border-dark bg-second font-mono text-dark">
                <SelectGroup>
                  <SelectItem value="0">0</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-6">
          <Button variant={"personal"} size={"lg"} onClick={handleStartGame}>
            Start Game
          </Button>
        </div>
      </div>
    </div>
  )
}