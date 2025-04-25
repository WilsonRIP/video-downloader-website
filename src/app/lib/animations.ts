import { type Variants } from 'framer-motion'

export const ANIMATION_CONFIG = {
  heroDuration: 0.6,
  cardDuration: 0.4,
  featuredDelay: 0.2,
  staggerChildren: 0.1,
}

export const heroVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: ANIMATION_CONFIG.heroDuration, ease: 'easeOut' },
  },
}

export const sectionVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: ANIMATION_CONFIG.featuredDelay,
      staggerChildren: ANIMATION_CONFIG.staggerChildren,
    },
  },
}

export const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: ANIMATION_CONFIG.cardDuration, ease: 'easeOut' },
  },
}
