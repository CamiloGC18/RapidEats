import { Variants } from 'framer-motion';

/**
 * RapidEats Premium - Configuración de Animaciones con Framer Motion
 * Animaciones consistentes y fluidas en toda la aplicación
 */

// ========================================
// SPRING PHYSICS
// ========================================
export const springPhysics = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

export const springPhysicsSlow = {
  type: 'spring' as const,
  stiffness: 200,
  damping: 25,
};

export const springPhysicsFast = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 35,
};

// ========================================
// EASING FUNCTIONS
// ========================================
export const easing = {
  easeInOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
  easeOut: [0, 0, 0.2, 1] as [number, number, number, number],
  easeIn: [0.4, 0, 1, 1] as [number, number, number, number],
  spring: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
};

// ========================================
// PAGE TRANSITIONS
// ========================================
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.2,
      ease: easing.easeIn,
    },
  },
};

export const pageVariantsFade: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

// ========================================
// LIST ANIMATIONS (Staggered)
// ========================================
export const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const listItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: easing.easeOut,
    },
  },
};

// ========================================
// MODAL ANIMATIONS
// ========================================
export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export const modalContentVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springPhysics,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

export const modalContentVariantsMobile: Variants = {
  hidden: {
    opacity: 0,
    y: '100%',
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: springPhysics,
  },
  exit: {
    opacity: 0,
    y: '100%',
    transition: { duration: 0.2 },
  },
};

// ========================================
// CARD ANIMATIONS
// ========================================
export const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: easing.easeOut,
    },
  },
  hover: {
    y: -4,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    transition: {
      duration: 0.2,
      ease: easing.easeOut,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1,
    },
  },
};

// ========================================
// BUTTON ANIMATIONS
// ========================================
export const buttonTapAnimation = {
  scale: 0.98,
  transition: { duration: 0.1 },
};

export const buttonHoverAnimation = {
  scale: 1.02,
  transition: { duration: 0.2 },
};

// ========================================
// TOAST/NOTIFICATION ANIMATIONS
// ========================================
export const toastVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springPhysicsFast,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.15,
    },
  },
};

// ========================================
// SLIDE IN/OUT ANIMATIONS
// ========================================
export const slideInFromLeft: Variants = {
  hidden: {
    x: '-100%',
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.35,
      ease: easing.easeOut,
    },
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: {
      duration: 0.25,
      ease: easing.easeIn,
    },
  },
};

export const slideInFromRight: Variants = {
  hidden: {
    x: '100%',
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.35,
      ease: easing.easeOut,
    },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: {
      duration: 0.25,
      ease: easing.easeIn,
    },
  },
};

export const slideInFromTop: Variants = {
  hidden: {
    y: '-100%',
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.35,
      ease: easing.easeOut,
    },
  },
  exit: {
    y: '-100%',
    opacity: 0,
    transition: {
      duration: 0.25,
      ease: easing.easeIn,
    },
  },
};

export const slideInFromBottom: Variants = {
  hidden: {
    y: '100%',
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.35,
      ease: easing.easeOut,
    },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: {
      duration: 0.25,
      ease: easing.easeIn,
    },
  },
};

// ========================================
// FADE ANIMATIONS
// ========================================
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

export const fadeInUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: easing.easeOut,
    },
  },
};

export const fadeInScaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: easing.easeOut,
    },
  },
};

// ========================================
// LOADING ANIMATIONS
// ========================================
export const pulseVariants: Variants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const spinVariants: Variants = {
  spin: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ========================================
// HOVER EFFECTS
// ========================================
export const scaleOnHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
};

export const liftOnHover = {
  whileHover: {
    y: -4,
    transition: { duration: 0.2 },
  },
};

export const glowOnHover = {
  whileHover: {
    boxShadow: '0 0 20px rgba(6, 193, 103, 0.4)',
    transition: { duration: 0.2 },
  },
};

// ========================================
// SCROLL-TRIGGERED ANIMATIONS
// ========================================
export const scrollFadeIn = {
  initial: { opacity: 0, y: 30 },
  whileInView: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easing.easeOut,
    },
  },
  viewport: { once: true, margin: '-50px' },
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Crea variantes de stagger personalizadas
 */
export const createStaggerVariants = (staggerDelay = 0.05, delayChildren = 0.1): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: delayChildren,
    },
  },
});

/**
 * Crea animación de entrada con delay personalizado
 */
export const createDelayedFadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      delay,
      ease: easing.easeOut,
    },
  },
});
