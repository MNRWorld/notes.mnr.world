"use client";

import { Variants } from "framer-motion";

// Common animation variants used across components
export const commonVariants = {
  // Container animations
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  },

  fastStaggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  },

  // Item animations
  slideUpItem: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 },
    },
  },

  fadeInItem: {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.2 },
    },
  },

  slideInItem: {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: { duration: 0.2 },
    },
  },

  // Page transitions
  pageSlide: {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.3 },
    },
  },

  pageFade: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  },

  // Modal/Dialog animations
  modalBackdrop: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },

  modalContent: {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", damping: 25, stiffness: 300 },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: { duration: 0.2 },
    },
  },

  // Sidebar animations
  sidebarSlide: {
    hidden: { x: -320 },
    visible: {
      x: 0,
      transition: { type: "spring", damping: 30, stiffness: 300 },
    },
    exit: {
      x: -320,
      transition: { type: "spring", damping: 30, stiffness: 300 },
    },
  },

  // Hover effects
  hoverScale: {
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 },
    },
  },

  hoverLift: {
    hover: {
      y: -5,
      transition: { duration: 0.2 },
    },
    tap: {
      y: 0,
      transition: { duration: 0.1 },
    },
  },

  // Icon animations
  iconSpin: {
    spin: {
      rotate: 360,
      transition: { duration: 1, repeat: Infinity, ease: "linear" },
    },
  },

  iconPulse: {
    pulse: {
      scale: [1, 1.1, 1] as number[],
      transition: { duration: 1, repeat: Infinity },
    },
  },

  iconBounce: {
    bounce: {
      y: [0, -5, 0] as number[],
      transition: { duration: 0.5, repeat: Infinity },
    },
  },
} as const;

// Transition presets
export const transitions = {
  spring: { type: "spring", damping: 25, stiffness: 300 },
  easeOut: { duration: 0.3, ease: "easeOut" },
  fast: { duration: 0.2 },
  slow: { duration: 0.5 },
} as const;

// Helper function to create custom variants
export const createVariants = (
  hiddenState: Record<string, any>,
  visibleState: Record<string, any>,
  exitState?: Record<string, any>,
): Variants => ({
  hidden: hiddenState,
  visible: visibleState,
  ...(exitState && { exit: exitState }),
});

// Utility for common animation props
export const getAnimationProps = (variant: keyof typeof commonVariants) => ({
  variants: commonVariants[variant],
  initial: "hidden",
  animate: "visible",
  exit: "exit",
});

export const getStaggerProps = (variant: keyof typeof commonVariants) => ({
  variants: commonVariants[variant],
  initial: "hidden",
  animate: "visible",
});
