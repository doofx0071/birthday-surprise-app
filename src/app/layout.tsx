import type { Metadata } from 'next'
import { Inter, Playfair_Display, Poppins } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair-display',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: {
    default: 'Birthday Surprise',
    template: '%s | Birthday Surprise',
  },
  description: 'A beautiful birthday surprise web application with countdown timer, message collection, and memory map',
  keywords: ['birthday', 'surprise', 'countdown', 'messages', 'celebration'],
  authors: [{ name: 'Birthday Surprise Team' }],
  creator: 'Birthday Surprise Team',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://birthday-surprise-app.vercel.app',
    title: 'Birthday Surprise',
    description: 'A beautiful birthday surprise web application',
    siteName: 'Birthday Surprise',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Birthday Surprise',
    description: 'A beautiful birthday surprise web application',
  },
  robots: {
    index: false, // Keep private for the surprise
    follow: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${playfairDisplay.variable} ${poppins.variable} antialiased`}
    >
      <body className="min-h-screen bg-background text-foreground">
        <div id="root" className="relative">
          {children}
          <Toaster />
        </div>
      </body>
    </html>
  )
}
