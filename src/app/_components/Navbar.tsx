'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Poetsen_One } from 'next/font/google'
import { useState, useEffect } from 'react'
import ThemeToggle from './ThemeToggle'
import Image from 'next/image'
import { Open_Sans } from 'next/font/google'
import { WEBSITE_NAME } from '~/app/lib/types'

// Load Poetsen One (Google Font) at build‑time
const poetsen = Poetsen_One({
  weight: '400',
  subsets: ['latin'],
})

const openSans = Open_Sans({
  weight: '400',
  subsets: ['latin'],
})

export default function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Define navLinks inside the component
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/compressor', label: 'Compressor' },
  ]

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkScreenSize()

    // Add resize event listener
    window.addEventListener('resize', checkScreenSize)

    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Add scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`${
        openSans.className
      } sticky top-0 z-50 backdrop-blur-lg transition-all duration-300 ${
        isScrolled ? 'py-2' : 'py-3'
      } bg-white/70 text-gray-800 dark:bg-gray-900/70 dark:text-white ${
        isScrolled
          ? 'shadow-md dark:shadow-gray-700'
          : 'shadow-sm dark:shadow-gray-800'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center text-xl font-semibold tracking-wide md:text-2xl"
        >
          <Image
            src="/icons8-video-64.png"
            alt="Video Downloader"
            width={32}
            height={32}
            className="h-7 w-7 rounded-full"
            priority
          />
          <span className="ml-2 whitespace-nowrap hidden bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent sm:inline">
            {WEBSITE_NAME}
          </span>
        </Link>

        {/* Right-side content: Nav Links + Theme Toggle (Desktop) OR Menu Button + Theme Toggle (Mobile) */}
        <div className="flex items-center gap-4">
          {/* Desktop Navigation */}
          {!isMobile && (
            <ul className="flex gap-6">
              {navLinks.map(({ href, label }) => {
                const isActive = pathname === href
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`relative rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                        isActive
                          ? 'bg-teal-400/5 text-teal-500 dark:bg-teal-400/10 dark:text-teal-400'
                          : 'text-gray-600 hover:bg-teal-400/5 hover:text-teal-500 dark:text-gray-300 dark:hover:bg-teal-400/10 dark:hover:text-teal-400'
                      }`}
                    >
                      {label}
                      {isActive && (
                        <span className="absolute -bottom-0.5 left-0 h-0.5 w-full rounded bg-teal-500 dark:bg-teal-400" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}

          {/* Theme Toggle - common to both desktop and mobile */}
          <ThemeToggle />

          {/* Mobile Menu Button */}
          {isMobile && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="z-50 flex flex-col items-center justify-center space-y-1.5 md:hidden"
              aria-label="Toggle Menu"
            >
              <span
                className={`block h-0.5 w-6 bg-gray-800 transition-all duration-300 dark:bg-white ${
                  isOpen ? 'translate-y-1.5 rotate-45 transform' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-gray-800 transition-all duration-300 dark:bg-white ${
                  isOpen ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`block h-0.5 w-6 bg-gray-800 transition-all duration-300 dark:bg-white ${
                  isOpen ? '-translate-y-1.5 -rotate-45 transform' : ''
                }`}
              />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobile && isOpen && (
        <div
          className={`absolute top-full right-0 left-0 bg-white/95 shadow-md backdrop-blur-md md:hidden dark:bg-gray-900/95 dark:shadow-gray-700`}
        >
          <ul className="flex flex-col items-center space-y-4 py-4">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href
              return (
                <li key={href} className="w-full text-center">
                  <Link
                    href={href}
                    className={`mx-4 block rounded-md py-3 text-lg font-medium transition-colors ${
                      isActive
                        ? 'bg-teal-400/5 text-teal-500 dark:bg-teal-400/10 dark:text-teal-400'
                        : 'text-gray-800 hover:bg-teal-400/5 hover:text-teal-500 dark:text-white dark:hover:bg-teal-400/10 dark:hover:text-teal-400'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </header>
  )
}
