'use client'

import React, { type ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Transition } from 'framer-motion'
import { Poetsen_One } from 'next/font/google'
import clsx from 'clsx'

const poetsen = Poetsen_One({
  weight: '400',
  subsets: ['latin'],
})

// Derive the ButtonSize type from the allowed values
type ButtonSize = 'sm' | 'md' | 'lg' // Simplified as buttonSizes const is unused

// simple size presets (padding + base font size)
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'py-2 px-4 text-sm',
  md: 'py-4 px-8 text-base',
  lg: 'py-6 px-12 text-lg',
}

export type ButtonProps = {
  /** If provided, renders as a link */
  href?: string
  /** onClick handler (ignored if href is set) */
  onClick?: () => void
  /** Button contents */
  children: ReactNode

  /** Size preset: controls padding + font-size */
  size?: ButtonSize // Use the explicitly defined type

  /** Background color (Tailwind class, e.g. "bg-green-300") */
  bgClass?: string
  /** Text color (Tailwind class, e.g. "text-white") */
  textClass?: string
  /** Border radius (Tailwind class, e.g. "rounded-lg") */
  radiusClass?: string

  /** Hover / Tap scales */
  hoverScale?: number
  tapScale?: number

  /** Transition config */
  transitionType?: 'tween' | 'spring'
  transitionDuration?: number // in seconds

  /** Additional custom classes */
  className?: string
  /** Extra inline styles */
  styleOverrides?: React.CSSProperties

  /** Native button type (ignored if href is set) */
  type?: 'button' | 'submit' | 'reset'
}

const commonClassNames: string = clsx(
  poetsen.className,
  'inline-block cursor-pointer font-semibold transition-transform duration-200',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
  'transition-colors duration-150 ease-in-out',
  'disabled:opacity-50 disabled:cursor-not-allowed'
)

// Define size classes using clsx for better type safety
// Using sizeStyles directly as clsx is not needed for these simple strings
const sizeClasses: Record<ButtonSize, string> = sizeStyles

export default function Button({
  href,
  onClick,
  children,
  size = 'md',
  bgClass = 'bg-green-300', // Default background
  textClass = 'text-gray-800', // Default text color
  radiusClass = 'rounded-lg', // Default border radius
  hoverScale = 1.2,
  tapScale = 0.95,
  transitionType = 'spring',
  transitionDuration = 0.3,
  className = '',
  styleOverrides = {},
  type = 'button',
}: ButtonProps) {
  // Build the Framer Motion transition object
  const transition =
    transitionType === 'spring'
      ? {
          type: 'spring',
          duration: transitionDuration,
          stiffness: 300,
          damping: 20,
        }
      : { type: 'tween', duration: transitionDuration }

  // Construct final className using clsx
  const finalClassName = clsx(
    commonClassNames,
    sizeClasses[size],
    bgClass, // Apply custom background
    textClass, // Apply custom text color
    radiusClass, // Apply custom border radius
    className // Apply any additional classes passed via props
  )

  if (href) {
    return (
      <Link href={href} passHref legacyBehavior>
        <motion.a
          className={finalClassName} // Use the combined class name
          whileHover={{ scale: hoverScale }}
          whileTap={{ scale: tapScale }}
          transition={transition}
          style={styleOverrides}
        >
          {children}
        </motion.a>
      </Link>
    )
  } else {
    return (
      <motion.button
        type={type}
        onClick={onClick}
        className={finalClassName} // Use the combined class name
        whileHover={{ scale: hoverScale }}
        whileTap={{ scale: tapScale }}
        transition={transition}
        style={styleOverrides}
      >
        {children}
      </motion.button>
    )
  }
}
