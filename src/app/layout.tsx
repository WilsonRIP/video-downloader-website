// Import necessary modules and components
import '~/styles/globals.css';
import { WEBSITE_NAME, WEBSITE_DESCRIPTION } from '~/app/lib/types';
import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { TRPCReactProvider } from '~/trpc/react';
import Navbar from './_components/Navbar';
import { ThemeProvider } from './_components/theme-provider';
import Footer from './_components/Footer';

// Define metadata for the website
export const metadata: Metadata = {
  title: WEBSITE_NAME,
  description: WEBSITE_DESCRIPTION,
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

// Initialize the Geist font
const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

/**
 * Root layout component for the application.
 * 
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Child components.
 * @returns {JSX.Element} The root layout element.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): JSX.Element {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div
            className={`
              min-h-screen 
              bg-white 
              dark:bg-gradient-to-b 
              dark:from-[#2e026d] 
              dark:to-[#15162c]
            `}
          >
            <TRPCReactProvider>
              <Navbar />
              <main>{children}</main>
              <Footer />
            </TRPCReactProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
