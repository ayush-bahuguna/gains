import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Gains',
    short_name: 'Gains',
    description: 'Your personal fitness tracker',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#060403',
    theme_color: '#060403',
    icons: [
      { src: '/apple-touch-icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  }
}
