"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  commonVariants,
  getAnimationProps,
  getStaggerProps,
} from "@/lib/animations";
import { cn } from "@/lib/utils";

// Animated Container Component
interface AnimatedContainerProps {
  children: React.ReactNode;
  variant?: keyof typeof commonVariants;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  delay?: number;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  variant = "staggerContainer",
  className,
  as: Component = "div",
  delay = 0,
}) => {
  const MotionComponent = motion[Component as keyof typeof motion] as any;

  return (
    <MotionComponent
      {...getStaggerProps(variant)}
      className={className}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </MotionComponent>
  );
};

// Animated Item Component
interface AnimatedItemProps {
  children: React.ReactNode;
  variant?: keyof typeof commonVariants;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  whileHover?: any;
  whileTap?: any;
  onClick?: () => void;
}

export const AnimatedItem: React.FC<AnimatedItemProps> = ({
  children,
  variant = "slideUpItem",
  className,
  as: Component = "div",
  whileHover,
  whileTap,
  onClick,
}) => {
  const MotionComponent = motion[Component as keyof typeof motion] as any;

  return (
    <MotionComponent
      {...getAnimationProps(variant)}
      className={className}
      whileHover={whileHover}
      whileTap={whileTap}
      onClick={onClick}
    >
      {children}
    </MotionComponent>
  );
};

// Page Transition Wrapper
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
  variant?: "slide" | "fade";
}

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  className,
  variant = "slide",
}) => {
  const variantName = variant === "slide" ? "pageSlide" : "pageFade";

  return (
    <motion.div
      {...getAnimationProps(variantName)}
      className={cn("h-full", className)}
    >
      {children}
    </motion.div>
  );
};

// Stagger List Component
interface StaggerListProps {
  children: React.ReactNode[];
  className?: string;
  itemClassName?: string;
  variant?: "fast" | "normal";
  as?: keyof JSX.IntrinsicElements;
}

export const StaggerList: React.FC<StaggerListProps> = ({
  children,
  className,
  itemClassName,
  variant = "normal",
  as: Component = "div",
}) => {
  const containerVariant =
    variant === "fast" ? "fastStaggerContainer" : "staggerContainer";
  const MotionComponent = motion[Component as keyof typeof motion] as any;

  return (
    <MotionComponent
      {...getStaggerProps(containerVariant)}
      className={className}
    >
      {children.map((child, index) => (
        <AnimatedItem
          key={index}
          variant="slideUpItem"
          className={itemClassName}
        >
          {child}
        </AnimatedItem>
      ))}
    </MotionComponent>
  );
};

// Modal Animation Component
interface AnimatedModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const AnimatedModal: React.FC<AnimatedModalProps> = ({
  children,
  isOpen,
  onClose,
  className,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            {...getAnimationProps("modalBackdrop")}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Content */}
          <motion.div
            {...getAnimationProps("modalContent")}
            className={cn(
              "fixed inset-0 z-50 flex items-center justify-center p-4",
              className,
            )}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Sidebar Animation Component
interface AnimatedSidebarProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  side?: "left" | "right";
  className?: string;
}

export const AnimatedSidebar: React.FC<AnimatedSidebarProps> = ({
  children,
  isOpen,
  onClose,
  side = "left",
  className,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            {...getAnimationProps("modalBackdrop")}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: side === "left" ? -320 : 320 }}
            animate={{ x: 0 }}
            exit={{ x: side === "left" ? -320 : 320 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "fixed top-0 h-full w-80 bg-background border-border z-50",
              side === "left" ? "left-0 border-r" : "right-0 border-l",
              className,
            )}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Card with Hover Animation
interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: "scale" | "lift" | "none";
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  onClick,
  hoverEffect = "scale",
}) => {
  const hoverProps =
    hoverEffect === "scale"
      ? commonVariants.hoverScale
      : hoverEffect === "lift"
        ? commonVariants.hoverLift
        : {};

  return (
    <AnimatedItem
      variant="fadeInItem"
      className={className}
      whileHover={(hoverProps as any).hover}
      whileTap={(hoverProps as any).tap}
      onClick={onClick}
    >
      {children}
    </AnimatedItem>
  );
};

// Loading Spinner Animation
interface AnimatedSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const AnimatedSpinner: React.FC<AnimatedSpinnerProps> = ({
  className,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <motion.div
      {...commonVariants.iconSpin}
      animate="spin"
      className={cn(
        "rounded-full border-2 border-transparent border-t-current",
        sizeClasses[size],
        className,
      )}
    />
  );
};

// Icon with Animation
interface AnimatedIconProps {
  children: React.ReactNode;
  animation?: "spin" | "pulse" | "bounce" | "none";
  className?: string;
}

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  children,
  animation = "none",
  className,
}) => {
  const animationProps =
    animation !== "none"
      ? {
          ...commonVariants[
            `icon${animation.charAt(0).toUpperCase() + animation.slice(1)}` as keyof typeof commonVariants
          ],
          animate: animation,
        }
      : {};

  return (
    <motion.div {...animationProps} className={className}>
      {children}
    </motion.div>
  );
};

// Fade transition for conditional content
interface FadeTransitionProps {
  children: React.ReactNode;
  show: boolean;
  className?: string;
}

export const FadeTransition: React.FC<FadeTransitionProps> = ({
  children,
  show,
  className,
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div {...getAnimationProps("fadeInItem")} className={className}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Grid with stagger animation
interface AnimatedGridProps {
  children: React.ReactNode[];
  className?: string;
  itemClassName?: string;
  cols?: 1 | 2 | 3 | 4;
}

export const AnimatedGrid: React.FC<AnimatedGridProps> = ({
  children,
  className,
  itemClassName,
  cols = 3,
}) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <AnimatedContainer
      variant="staggerContainer"
      className={cn("grid gap-4", gridCols[cols], className)}
    >
      {children.map((child, index) => (
        <AnimatedItem
          key={index}
          variant="slideUpItem"
          className={itemClassName}
        >
          {child}
        </AnimatedItem>
      ))}
    </AnimatedContainer>
  );
};
