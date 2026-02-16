import './globals.css'
import { AuthProvider } from '../components/providers/AuthProvider'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'Andalusia Travel - Pakej Umrah & Haji Terpercaya Malaysia',
  description: 'Andalusia Travel & Tours - Penyedia pakej umrah dan haji terpercaya di Malaysia sejak 22 tahun. MATTA Award winner dengan perkhidmatan premium.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Andalusia Travel',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Andalusia Travel',
    'application-name': 'Andalusia Travel',
    'msapplication-TileColor': '#059669',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ms">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#059669', // Andalusia green
                },
              },
              error: {
                duration: 5000,
                style: {
                  background: '#ef4444',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
