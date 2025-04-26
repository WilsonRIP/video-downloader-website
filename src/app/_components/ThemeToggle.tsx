'use client';

import { useTheme } from 'next-themes';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STAR_COUNT = 5;
const RAY_COUNT = 8;

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  // useTheme provides resolvedTheme (system/stored preference) and setTheme function
  const { resolvedTheme, setTheme } = useTheme();
  // mounted state is crucial for next-themes hydration
  const [mounted, setMounted] = useState(false);

  // Effect to confirm the component is mounted on the client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if the current resolved theme is 'dark'
  const isDark = resolvedTheme === 'dark';

  // Callback function to toggle the theme
  const toggleTheme = useCallback(() => {
    // Determine the new theme based on the current state
    const newTheme = isDark ? 'light' : 'dark';
    // Use setTheme from next-themes to change the theme
    setTheme(newTheme);
    // next-themes automatically handles adding/removing the 'dark' class on <html>
  }, [isDark, setTheme]); // Depend on isDark and setTheme

  /** Generate static positions & timings for stars so they don't jump on re-render */
  // Memoize star data as it's static after initial generation
  const stars = useMemo(
    () =>
      Array.from({ length: STAR_COUNT }, () => ({
        size: Math.random() * 2 + 1, // Size between 1 and 3
        top: `${Math.random() * 100}%`, // Random vertical position
        left: `${Math.random() * 60}%`, // Random horizontal position (within bounds)
        delay: Math.random() * 2, // Animation delay up to 2 seconds
        duration: Math.random() * 2 + 1, // Animation duration between 1 and 3 seconds
      })),
    [] // Empty dependency array means this runs once on mount
  );

  /** Precompute sun-ray rotation angles */
  // Memoize ray rotation angles
  const rays = useMemo(
    () => Array.from({ length: RAY_COUNT }, (_, i) => i * (360 / RAY_COUNT)),
    [] // Empty dependency array means this runs once on mount
  );

  // Render a placeholder until mounted to prevent hydration errors
  if (!mounted) {
    return (
      <div
        className={`h-8 w-16 rounded-full bg-gray-200 dark:bg-gray-700 ${className}`}
        suppressHydrationWarning // Prevents hydration warnings for this placeholder
      />
    );
  }

  // Main render function for the mounted component
  return (
    <motion.button
      onClick={toggleTheme}
      // Dynamically set aria-label based on the next theme state for accessibility
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      // Framer motion animations for hover and tap states
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      // Tailwind classes for styling the button appearance
      className={`relative inline-flex h-8 w-16 items-center rounded-full border transition-colors duration-300 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:outline-none
                 ${
                   isDark
                     ? 'border-blue-500 from-blue-700 to-indigo-800 bg-gradient-to-r'
                     : 'border-amber-400 from-amber-300 to-orange-300 bg-gradient-to-r'
                 }
                 ${className}
                `}
      suppressHydrationWarning // Prevents hydration warnings on the main button element
    >
      {/* Thumb element that slides */}
      <motion.div
        className="absolute top-1 left-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md dark:bg-gray-800"
        // Animate the thumb's position (x-axis) and rotation
        animate={{
          x: isDark ? 32 : 0, // Slide right by 32px in dark mode
          rotate: isDark ? 180 : 0, // Rotate 180 degrees in dark mode
        }}
        // Spring transition for smooth movement
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {/* Render MoonIcon in dark mode, SunIcon in light mode */}
        <AnimatePresence mode="wait" initial={false}>
           {isDark ? (
             <motion.div
               key="moon"
               initial={{ opacity: 0, scale: 0.5 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.5 }}
               transition={{ duration: 0.2 }}
             >
               <MoonIcon />
             </motion.div>
           ) : (
             <motion.div
               key="sun"
               initial={{ opacity: 0, scale: 0.5 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.5 }}
               transition={{ duration: 0.2 }}
             >
               <SunIcon />
             </motion.div>
           )}
         </AnimatePresence>
      </motion.div>

      {/* Decorative background layer (overflow hidden) */}
      <div className="absolute inset-0 overflow-hidden rounded-full">
        {/* Stars layer, visible only in dark mode */}
        <motion.div
          className="absolute inset-0"
          // Animate opacity based on dark mode state
          animate={{ opacity: isDark ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Map over star data to render individual stars */}
          {stars.map((s, i) => (
            <motion.div
              key={i} // Key prop for list rendering
              className="absolute rounded-full bg-white"
              initial={false} // Don't use initial state for this continuous animation
              // Animate opacity and scale for a twinkling effect
              animate={{
                opacity: isDark ? [0.2, 0.8, 0.2] : [0, 0, 0], // Twinkle in dark mode, hidden in light
                scale: isDark ? [0.8, 1, 0.8] : 0.8, // Scale slightly in dark mode
              }}
              // Transition properties for twinkling animation
              transition={{
                duration: s.duration, // Use unique duration for each star
                repeat: Infinity, // Repeat animation infinitely
                delay: s.delay, // Use unique delay for each star
                ease: 'easeInOut', // Smooth easing function
              }}
              // Apply static style properties (position and size)
              style={{
                width: `${s.size}px`,
                height: `${s.size}px`,
                top: s.top,
                left: s.left,
              }}
            />
          ))}
        </motion.div>

        {/* Sun Rays layer, visible only in light mode */}
        <AnimatePresence>
          {/* Only render rays if not in dark mode */}
          {!isDark && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              // Animate presence for smooth mount/unmount
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Map over ray angles to render individual rays */}
              {rays.map((angle, i) => (
                <motion.div
                  key={i} // Key prop for list rendering
                  className="absolute origin-center rounded-sm bg-yellow-200"
                  style={{
                    width: '2px',
                    height: i % 2 === 0 ? '12px' : '8px', // Alternate ray height
                    // Position and rotate the ray from the center
                    transform: `rotate(${angle}deg) translateY(-50%)`,
                    top: '50%',
                    left: '50%',
                  }}
                  // Animate scale and opacity for a pulsing/shimmering effect
                  animate={{ scaleY: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{
                    duration: 2, // Animation duration
                    repeat: Infinity, // Repeat infinitely
                    delay: i * 0.2, // Stagger delay based on index
                    ease: 'easeInOut', // Smooth easing
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
}

// SVG Icons extracted for clarity
// Added aria-hidden="true" as the parent button has aria-label
function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      stroke="#FFB700" // Stroke color for sun
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      fill="none"
      aria-hidden="true" // Hide from screen readers as parent has label
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      stroke="#FFFFFF" // Stroke color for moon (white)
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      fill="none"
      aria-hidden="true" // Hide from screen readers as parent has label
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
