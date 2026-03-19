import type { Metadata, Viewport } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'react-hot-toast'
import { QueryProvider } from '@/components/shared/QueryProvider'
import { LocaleProvider } from '@/components/shared/LocaleProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mezan — Short Videos & Shop',
  description: 'Discover short-form videos and shop your favorite creator products.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Mezan',
  },
  openGraph: {
    title: 'Mezan',
    description: 'Short videos. Shop your favorite creators.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <QueryProvider>
      <html lang="en" className="dark">
        <body className="font-sans bg-black text-white antialiased">
          <LocaleProvider>
          {children}
          </LocaleProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
              },
            }}
          />
        </body>
      </html>
      </QueryProvider>
    </ClerkProvider>
  )
}
