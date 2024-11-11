'use client'

import { usePathname } from 'next/navigation'
import SettingsButton from "./(buttons)/settingsButton"
import BackButton from "./(buttons)/backButton"
import ExitGameButton from "./(buttons)/exitGameButton"

export default function Footer() {
  const pathname = usePathname()?.split('?')[0] ?? '/'
  const exitButtonPaths = [
    '/game/offline/play',
    /^\/game\/single\/[^/]+$/,
    /^\/stats\/[^/]+$/,
    /^\/game\/local\/[^/]+$/,
    /^\/game\/local\/room\/[^/]+$/,
    /^\/game\/online\/[^/]+$/
  ]

  const showExitButton = exitButtonPaths.some(pattern => 
    typeof pattern === 'string' ? pathname === pattern : pattern.test(pathname)
  )

  return (
    <footer className="flex w/full items-center justify-between p-3">
      {showExitButton ? <ExitGameButton /> : pathname !== '/' && <BackButton />}
      <div className="flex-grow" />
      <SettingsButton />
    </footer>
  )
}