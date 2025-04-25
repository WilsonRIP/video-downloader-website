'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
// Correctly import ThemeProviderProps if needed, or remove if inferred
// Usually, it's exported directly or inferred from the component usage.
// Let's try removing it first, as it might be inferred.

// Define props type based on NextThemesProvider
type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Pass common props like attribute="class" and defaultTheme="system"
  // These defaults are often set here but can be overridden via props
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
