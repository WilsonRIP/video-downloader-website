'use client'

import React, { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'

type LazyLoadProps = {
  children: React.ReactNode
  placeholder?: React.ReactNode
  threshold?: number
  rootMargin?: string
}

/**
 * LazyLoad component - Only renders children when they come into viewport
 * Improves initial load performance by deferring non-critical components
 */
export default function LazyLoad({
  children,
  placeholder = (
    <div className="h-32 w-full animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
  ),
  threshold = 0.1,
  rootMargin = '100px',
}: LazyLoadProps) {
  const [loaded, setLoaded] = useState(false)
  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce: true,
  })

  useEffect(() => {
    if (inView && !loaded) {
      setLoaded(true)
    }
  }, [inView, loaded])

  return <div ref={ref}>{loaded ? children : placeholder}</div>
}
