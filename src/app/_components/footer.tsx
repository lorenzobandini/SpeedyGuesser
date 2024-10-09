'use client'

import { usePathname } from 'next/navigation'
import SettingsButton from "./(buttons)/settingsButton"
import BackButton from "./(buttons)/backButton"

export default function Footer() {
  const pathname = usePathname()

  return (
    <footer className="flex w-full items-center justify-between p-3">
      {pathname !== '/' && <BackButton />}
      <div className="flex-grow" />
      <SettingsButton />
    </footer>
  )
}