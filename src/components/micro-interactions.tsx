"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MicroInteractionProps {
  children: ReactNode;
  type?: "bounce" | "pulse" | "glow" | "lift" | "success";
  trigger?: "hover" | "tap" | "auto" | "manual";
  className?: string;
  onClick?: () => void;
}

export function MicroInteraction({ 
  children, 
  type = "bounce", 
  trigger = "hover",
  className = "",
  onClick 
}: MicroInteractionProps) {
  const getAnimation = () => {
    switch (type) {
      case "bounce":
        return {
          scale: [1, 1.05, 1],
          transition: { duration: 0.3, ease: "easeInOut" }
        };
      case "pulse":
        return {
          scale: [1, 1.02, 1],
          transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
        };
      case "glow":
        return {
          boxShadow: [
            "0 0 0 0 hsl(var(--primary) / 0)",
            "0 0 20px 0 hsl(var(--primary) / 0.3)",
            "0 0 0 0 hsl(var(--primary) / 0)"
          ],
          transition: { duration: 0.6, ease: "easeInOut" }
        };
      case "lift":
        return {
          y: -4,
          scale: 1.02,
          transition: { duration: 0.2, ease: "easeOut" }
        };
      case "success":
        return {
          scale: [1, 1.1, 1],
          rotate: [0, -5, 5, 0],
          transition: { duration: 0.5, ease: "easeInOut" }
        };
      default:
        return {};
    }
  };

  const animationProps = trigger === "hover" 
    ? { whileHover: getAnimation() }
    : trigger === "tap"
    ? { whileTap: getAnimation() }
    : trigger === "auto"
    ? { animate: getAnimation() }
    : {};

  return (
    <motion.div
      className={className}
      onClick={onClick}
      {...animationProps}
    >
      {children}
    </motion.div>
  );
}

// Specific micro-interaction components
export function SuccessIndicator({ children, show }: { children: ReactNode; show: boolean }) {
  return (
    <motion.div
      animate={show ? {
        scale: [1, 1.1, 1],
        transition: { duration: 0.4, ease: "easeOut" }
      } : {}}
      className={show ? "success-pulse" : ""}
    >
      {children}
    </motion.div>
  );
}

export function ErrorShake({ children, shake }: { children: ReactNode; shake: boolean }) {
  return (
    <motion.div
      animate={shake ? {
        x: [-2, 2, -2, 2, 0],
        transition: { duration: 0.4, ease: "easeInOut" }
      } : {}}
    >
      {children}
    </motion.div>
  );
}

export function LoadingPulse({ children }: { children: ReactNode }) {
  return (
    <motion.div
      animate={{
        opacity: [0.5, 1, 0.5],
        transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
      }}
    >
      {children}
    </motion.div>
  );
}

export function FadeInUp({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay, 
        ease: "backOut",
        scale: { type: "spring", stiffness: 300, damping: 20 }
      }}
    >
      {children}
    </motion.div>
  );
}
