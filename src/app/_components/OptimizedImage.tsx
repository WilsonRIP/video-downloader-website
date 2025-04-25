'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useInView } from 'react-intersection-observer'
import clsx from 'clsx'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  sizes?: string
  style?: React.CSSProperties
  objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
  quality?: number
  fill?: boolean
  onLoad?: () => void
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
  placeholderSrc?: string
  blurDataURL?: string
  aspectRatio?: number
}

/**
 * OptimizedImage - A wrapper around Next.js Image component with added optimizations
 * - Lazy loads images using intersection observer
 * - Shows a placeholder during loading
 * - Handles proper sizing and formats
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  style,
  objectFit = 'cover',
  quality = 85,
  fill = false,
  onLoad,
  onError,
  placeholderSrc,
  blurDataURL,
  aspectRatio,
}: OptimizedImageProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px',
  })

  const imageRef = useRef<HTMLDivElement>(null)

  // Handle external URLs vs local images
  const isExternal = src.startsWith('http') || src.startsWith('https')

  // Use placeholder color that matches theme
  const placeholderColor = 'bg-gray-200 dark:bg-gray-700'

  // Intersection Observer setup
  useEffect(() => {
    const intersectionObserver = new IntersectionObserver((entries) => {
      // Implementation of Intersection Observer
    })

    if (imageRef.current) {
      intersectionObserver.observe(imageRef.current)
    }

    return () => {
      intersectionObserver.disconnect()
    }
  }, [])

  // Render placeholder or actual image based on visibility
  return (
    <div
      ref={imageRef}
      className={clsx('relative overflow-hidden', className)}
      style={{
        width: width ?? '100%',
        height: height ?? 'auto',
        aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
        ...style,
      }}
    >
      {/* Low-Quality Image Placeholder (LQIP) or Blur Placeholder */}
      <Image
        src={
          placeholderSrc ??
          blurDataURL ??
          'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
        }
        alt={alt}
        fill
        sizes={sizes ?? '100vw'}
        className={clsx(
          'absolute inset-0 object-cover transition-opacity duration-500 ease-in-out',
          inView ? 'opacity-0' : 'opacity-100',
          placeholderSrc || blurDataURL ? 'blur-md' : ''
        )}
        aria-hidden="true"
        priority={priority}
      />

      {/* Actual High-Quality Image (conditionally rendered) */}
      {inView && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes ?? '100vw'}
          quality={quality ?? 75}
          priority={priority}
          className={clsx(
            'absolute inset-0 object-cover transition-opacity duration-500 ease-in-out',
            'opacity-100'
          )}
        />
      )}
    </div>
  )
}
