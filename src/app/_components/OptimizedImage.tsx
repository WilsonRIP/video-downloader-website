'use client';

import React from 'react';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
  objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
  quality?: number;
  fill?: boolean;
  onLoad?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
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
}: OptimizedImageProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px',
  });

  // Handle external URLs vs local images
  const isExternal = src.startsWith('http') || src.startsWith('https');
  
  // Use placeholder color that matches theme
  const placeholderColor = 'bg-gray-200 dark:bg-gray-700';
  
  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      style={{
        ...style,
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : fill ? '100%' : 'auto',
      }}
    >
      {inView || priority ? (
        // Next.js optimized image with proper props
        <Image
          src={src}
          alt={alt}
          width={width || (fill ? undefined : 1200)}
          height={height || (fill ? undefined : 800)}
          className={`transition-opacity duration-500 ${objectFit ? `object-${objectFit}` : ''}`}
          style={{ objectFit }}
          quality={quality}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          priority={priority}
          onLoad={onLoad}
          onError={onError || ((e) => {
            console.error(`Failed to load image: ${src}`);
            // If there's an error, we could set a fallback image here
            if (isExternal) {
              e.currentTarget.src = 'https://via.placeholder.com/400?text=Image+Not+Found';
            }
          })}
          fill={fill}
        />
      ) : (
        // Show placeholder until image is in view
        <div className={`absolute inset-0 ${placeholderColor} animate-pulse rounded`} />
      )}
    </div>
  );
}
