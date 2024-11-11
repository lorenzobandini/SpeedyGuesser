import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SpeedyGuesser',
    short_name: 'SpeedyG',
    description: 'Game to be played by three people where two people have to make the third person guess as many words as possible by saying one word each',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/SpeedyGuesserLogo-LittleRounded.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/SpeedyGuesserLogo-BigRounded.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}