import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Live Meeting Helper',
  description: 'Real-time meeting transcription with Google Cloud Speech-to-Text',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
