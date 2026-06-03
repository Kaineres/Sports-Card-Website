import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, Libre_Baskerville, IBM_Plex_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import Nav from '@/components/nav'
import { WatchlistProvider } from '@/lib/watchlist-context'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700'],
})

const baskerville = Libre_Baskerville({
  subsets: ['latin'],
  variable: '--font-baskerville',
  weight: ['400', '700'],
  style: ['normal', 'italic'],
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-plex-mono',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  title: 'SlabMetrics — Sports Card Analytics',
  description: 'Real sports card prices, grading info, and market analytics for serious collectors.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${jakarta.variable} ${baskerville.variable} ${plexMono.variable}`}
      >
        <body>
          <WatchlistProvider>
            <Nav />
            <main style={{ paddingTop: 'var(--nav-h)' }}>
              {children}
            </main>
          </WatchlistProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
