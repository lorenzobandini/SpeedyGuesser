'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from "~/components/ui/button"

const getWords = (language: string) => {
  const words = {
    'IT': ['cane', 'gatto', 'casa', 'albero', 'sole'],
    'EN': ['dog', 'cat', 'house', 'tree', 'sun']
  }
  return words[language as keyof typeof words] || words.EN
}

export default function Game() {
  const searchParams = useSearchParams()
  const language = searchParams.get('language') ?? 'IT'
  const time = parseInt(searchParams.get('time') ?? '60')
  const passes = parseInt(searchParams.get('passes') ?? '3')

  const [words, setWords] = useState<string[]>([])
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [remainingTime, setRemainingTime] = useState(time)
  const [remainingPasses, setRemainingPasses] = useState(passes)
  const [isPaused, setIsPaused] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    setWords(getWords(language))
  }, [language])

  useEffect(() => {
    if (remainingTime > 0 && !isPaused) {
      const timer = setTimeout(() => setRemainingTime(remainingTime - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [remainingTime, isPaused])

  const handleCorrect = () => {
    setScore(score + 1)
    nextWord()
  }

  const handleIncorrect = () => {
    setScore(score - 1)
    nextWord()
  }

  const handlePass = () => {
    if (remainingPasses > 0) {
      setRemainingPasses(remainingPasses - 1)
      nextWord()
    }
  }

  const nextWord = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1)
    } else {
      setWords(getWords(language))
      setCurrentWordIndex(0)
    }
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="flex flex-grow flex-col items-center justify-center px-4">
        <h1 className="mb-10 text-5xl font-extrabold tracking-tight">
          <span className="text-light">Speedy</span>
          <span className="text-dark">Guesser</span>
        </h1>

        <div className="mb-8 text-4xl font-bold">
          {words[currentWordIndex]}
        </div>

        <div className="mb-8 text-2xl">
          Time: {remainingTime}s | Passes: {remainingPasses} | Score: {score}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="personal" size="lg" onClick={handleCorrect}>
            Correct (+)
          </Button>
          <Button variant="personal" size="lg" onClick={handleIncorrect}>
            Incorrect (-)
          </Button>
          <Button variant="personal" size="lg" onClick={handlePass} disabled={remainingPasses === 0}>
            Pass
          </Button>
          <Button variant="personal" size="lg" onClick={togglePause}>
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
        </div>
      </div>
    </div>
  )
}