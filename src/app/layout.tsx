import '~/styles/globals.css'
import { WEBSITE_NAME, WEBSITE_DESCRIPTION } from '~/app/lib/types'

import { type Metadata } from 'next'
import { Geist } from 'next/font/google'

import { TRPCReactProvider } from '~/trpc/react'
import Navbar from './_components/Navbar'
import { ThemeProvider } from './_components/theme-provider'
import Footer from './_components/Footer'
export const metadata: Metadata = {
  title: WEBSITE_NAME,
  description: WEBSITE_DESCRIPTION,
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
