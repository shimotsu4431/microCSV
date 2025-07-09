import { Geist, Geist_Mono } from 'next/font/google'
import '@mantine/core/styles.css'
import { ColorSchemeScript } from '@mantine/core'
import { Providers } from './providers'
import type { Metadata } from 'next'

const siteName = 'microCSV'
const description =
  'microCMSのコンテンツを一括で取得し、CSV形式でダウンロードするツールです。'
const url = 'https://micro-csv.vercel.app'

export const metadata: Metadata = {
  title: siteName,
  description,
  metadataBase: new URL(url),
  openGraph: {
    title: siteName,
    description,
    url,
    siteName,
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: siteName,
    description,
  },
}

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
