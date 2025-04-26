// Import necessary modules and components
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Poetsen_One, Open_Sans } from 'next/font/google';
import { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';
import Image from 'next/image';
import { WEBSITE_NAME } from '~/app/lib/types';

// Load fonts at build-time
const poetsen = Poetsen_One({
  weight: '400',
  subsets: ['latin'],
});

const openSans = Open_Sans({
  weight: '400',
  subsets: ['latin'],
});

/**
 * Navbar component for the application.
 * Handles navigation, mobile menu toggle, theme toggle, and scroll effects.
 *
 * @returns {JSX.Element} The navbar element.
 */
export default function Navbar(): JSX.Element {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Define nav links
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/compressor', label: 'Compressor' },
  ];

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkScreenSize(); // Initial check
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize); // Cleanup
  }, []);

  // Add scroll detection for styling changes
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10); // Threshold for scroll detection
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll); // Cleanup
  }, []);

  // Close mobile menu on pressing Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    } else {
      document.removeEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);


  const mobileMenuId = 'mobile-menu-overlay';

  return (
    <header
      className={`
        ${openSans.className}
        sticky
        top-0
        z-50
        backdrop-blur-lg
        transition-all
        duration-300
        ${isScrolled ? 'py-2' : 'py-3'}
        bg-white/70
        text-gray-800
        dark:bg-gray-900/70
        dark:text-white
        ${
          isScrolled
            ? 'shadow-md dark:shadow-gray-700'
            : 'shadow-sm dark:shadow-gray-800'
        }
      `}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        {/* Logo and Site Name */}
        <Link
          href="/"
          className={`
            flex
            items-center
            text-xl
            font-semibold
            tracking-wide
            md:text-2xl
            ${poetsen.className}
          `}
          aria-label={`${WEBSITE_NAME} Home`}
        >
          <Image
            src="/icons8-video-64.png"
            alt="" // Alt text can be empty if the site name next to it describes the link target sufficiently. Or descriptive like "Video icon"
            width={32}
            height={32}
            className="h-7 w-7 rounded-full"
            priority // Since it's in the navbar, it's high priority
          />
          <span
            className={`
              ml-2
              whitespace-nowrap
              hidden
              bg-gradient-to-r
              from-teal-400
              to-blue-500
              bg-clip-text
              text-transparent
              sm:inline
            `}
          >
            {WEBSITE_NAME}
          </span>
        </Link>

        {/* Right-side content */}
        <div className="flex items-center gap-4">
          {/* Desktop Navigation */}
          {!isMobile && (
            <nav aria-label="Main navigation">
              <ul className="flex gap-6">
                {navLinks.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`
                        relative
                        rounded-md
                        px-3
                        py-2
                        text-sm
                        font-medium
                        transition-colors
                        duration-200
                        ${
                          pathname === href
                            ? 'bg-teal-400/5 text-teal-500 dark:bg-teal-400/10 dark:text-teal-400'
                            : 'text-gray-600 hover:bg-teal-400/5 hover:text-teal-500 dark:text-gray-300 dark:hover:bg-teal-400/10 dark:hover:text-teal-400'
                        }
                      `}
                      // Indicate current page for accessibility
                      aria-current={pathname === href ? 'page' : undefined}
                    >
                      {label}
                      {/* Active link indicator */}
                      {pathname === href && (
                        <span
                          className={`
                            absolute
                            -bottom-0.5
                            left-0
                            h-0.5
                            w-full
                            rounded
                            bg-teal-500
                            dark:bg-teal-400
                          `}
                        />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          {/* Theme Toggle */}
          {/* ThemeToggle component should ideally handle its own ARIA attributes */}
          <ThemeToggle />

          {/* Mobile Menu Button */}
          {isMobile && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="z-50 flex flex-col items-center justify-center space-y-1.5 md:hidden"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls={mobileMenuId}
            >
              {/* Hamburger Icon - Uses spans for animation */}
              <span
                className={`
                  block
                  h-0.5
                  w-6
                  bg-gray-800
                  transition-all
                  duration-300
                  dark:bg-white
                  ${isOpen ? 'translate-y-1.5 rotate-45 transform' : ''}
                `}
              />
              <span
                className={`
                  block
                  h-0.5
                  w-6
                  bg-gray-800
                  transition-all
                  duration-300
                  dark:bg-white
                  ${isOpen ? 'opacity-0' : 'opacity-100'}
                `}
              />
              <span
                className={`
                  block
                  h-0.5
                  w-6
                  bg-gray-800
                  transition-all
                  duration-300
                  dark:bg-white
                  ${isOpen ? '-translate-y-1.5 -rotate-45 transform' : ''}
                `}
              />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobile && isOpen && (
        // Use <nav> for semantic correctness if this is purely navigation links
        <div
          id={mobileMenuId} // Connects to aria-controls on the button
          className={`
            absolute
            top-full
            right-0
            left-0
            bg-white/95
            shadow-md
            backdrop-blur-md
            md:hidden
            dark:bg-gray-900/95
            dark:shadow-gray-700
          `}
          // Role and aria-hidden for accessibility when closed (though
          // conditional rendering handles this visually and for screen readers)
          // role="navigation" // Can add role if not using <nav> tag
          // aria-hidden={!isOpen} // Explicitly hide from AT when not open
        >
          <nav aria-label="Mobile navigation"> {/* Add semantic nav */}
            <ul className="flex flex-col items-center space-y-4 py-4">
              {navLinks.map(({ href, label }) => (
                <li key={href} className="w-full text-center">
                  <Link
                    href={href}
                    className={`
                      mx-4
                      block
                      rounded-md
                      py-3
                      text-lg
                      font-medium
                      transition-colors
                      ${
                        pathname === href
                          ? 'bg-teal-400/5 text-teal-500 dark:bg-teal-400/10 dark:text-teal-400'
                          : 'text-gray-800 hover:bg-teal-400/5 hover:text-teal-500 dark:text-white dark:hover:bg-teal-400/10 dark:hover:text-teal-400'
                      }
                    `}
                    // Indicate current page for accessibility
                    aria-current={pathname === href ? 'page' : undefined}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
