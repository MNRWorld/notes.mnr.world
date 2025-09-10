"use client";

import { Variants } from "framer-motion";

// Respect reduced motion preference at runtime
export const shouldReduceMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Common animation variants used across components (subtle defaults)
export const commonVariants = {
  // Container animations
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.04,
      },
    },
  },

  fastStaggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
      },
    },
  },

  // Item animations
  slideUpItem: {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.28, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: -8,
      transition: { duration: 0.18 },
    },
  },

  fadeInItem: {
    hidden: { opacity: 0, scale: 0.995 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.28, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.995,
      transition: { duration: 0.18 },
    },
  },

  slideInItem: {
    hidden: { opacity: 0, x: -8 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.28, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      x: 8,
      transition: { duration: 0.18 },
    },
  },

  // Page transitions
  pageSlide: {
    hidden: { opacity: 0, x: 12 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.36, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      x: -12,
      transition: { duration: 0.28 },
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
      transition: { duration: 0.18 },
    },
  },

  // Modal/Dialog animations
  modalBackdrop: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  },

  modalContent: {
    hidden: { opacity: 0, scale: 0.985, y: 8 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", damping: 22, stiffness: 260 },
    },
    exit: {
      opacity: 0,
      scale: 0.985,
      y: 8,
      transition: { duration: 0.18 },
    },
  },

  // Sidebar animations
  sidebarSlide: {
    hidden: { x: -300 },
    visible: {
      x: 0,
      transition: { type: "spring", damping: 26, stiffness: 260 },
    },
    exit: {
      x: -300,
      transition: { type: "spring", damping: 26, stiffness: 260 },
    },
  },

  // Hover effects
  hoverScale: {
    hover: {
      scale: 1.02,
      transition: { duration: 0.16 },
    },
    tap: {
      scale: 0.985,
      transition: { duration: 0.1 },
    },
  },

  hoverLift: {
    hover: {
      y: -4,
      transition: { duration: 0.16 },
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
      transition: { duration: 1.6, repeat: Infinity, ease: "linear" },
    },
  },

  iconPulse: {
    pulse: {
      scale: [1, 1.06, 1] as number[],
      transition: { duration: 1.1, repeat: Infinity },
    },
  },

  iconBounce: {
    bounce: {
      y: [0, -4, 0] as number[],
      transition: { duration: 0.5, repeat: Infinity },
    },
  },
} as const;

// Transition presets (subtle)
export const transitions = {
  spring: { type: "spring", damping: 22, stiffness: 260 },
  easeOut: { duration: 0.28, ease: "easeOut" },
  micro: { duration: 0.16 },
  slow: { duration: 0.45 },
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
export const getAnimationProps = (variant: keyof typeof commonVariants) => {
  const reduce = shouldReduceMotion();
  const v = commonVariants[variant];
  if (reduce) {
    // If reduced motion is requested, collapse to simple opacity toggles
    const reduced = { ...v } as any;
    if (reduced.hidden) reduced.hidden = { opacity: 0 };
    if (reduced.visible) reduced.visible = { opacity: 1 };
    if (reduced.exit) reduced.exit = { opacity: 0 };
    return {
      variants: reduced,
      initial: "hidden",
      animate: "visible",
      exit: "exit",
      transition: { duration: 0 },
    };
  }

  return {
    variants: v,
    initial: "hidden",
    animate: "visible",
    exit: "exit",
  };
};

export const getStaggerProps = (variant: keyof typeof commonVariants) => {
  const reduce = shouldReduceMotion();
  const v = commonVariants[variant];
  if (reduce) {
    const reduced = { ...v } as any;
    if (reduced.hidden) reduced.hidden = { opacity: 0 };
    if (reduced.visible) reduced.visible = { opacity: 1 };
    return {
      variants: reduced,
      initial: "hidden",
      animate: "visible",
      transition: { duration: 0 },
    };
  }
  return {
    variants: v,
    initial: "hidden",
    animate: "visible",
  };
};
