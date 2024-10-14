'use client'

import { usePathname } from 'next/navigation'
import SettingsButton from "./(buttons)/settingsButton"
import BackButton from "./(buttons)/backButton"
import ExitGameButton from "./(buttons)/exitGameButton"

export default function Footer() {
  const pathname = usePathname()

  return (
    <footer className="flex w-full items-center justify-between p-3">
      {pathname === '/game' ? <ExitGameButton /> : pathname !== '/' && <BackButton />}
      <div className="flex-grow" />
      <SettingsButton />
    </footer>
  )
}