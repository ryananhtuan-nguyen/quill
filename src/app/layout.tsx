import Providers from '@/components/Providers'
import { cn, constructMetadata } from '@/libs/utils'
import { Inter } from 'next/font/google'
import './globals.css'

import 'react-loading-skeleton/dist/skeleton.css'
import 'simplebar-react/dist/simplebar.min.css'

import { Toaster } from '@/components/ui/toaster'
import NavBar from '@/components/NavBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = constructMetadata()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light">
      <Providers>
        <body
          className={cn(
            'min-h-screen font-sans antialiased grainy',
            inter.className
          )}
        >
          <Toaster />
          <NavBar />
          {children}
        </body>
      </Providers>
    </html>
  )
}
