'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

// Define props type based on NextThemesProvider if direct import fails
type CustomThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>

export function ThemeProvider({
  children,
  ...props
}: CustomThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange // Optional: Improves performance by disabling theme change animations
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
