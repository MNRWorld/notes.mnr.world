"use client";

import { motion, Variants } from "framer-motion";
import React, { ReactNode } from "react";
import { getAnimationProps, getStaggerProps } from "@/lib/animations";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export default function PageTransition({
  children,
  className = "",
}: PageTransitionProps) {
  return (
    <motion.div {...getAnimationProps("pageSlide")} className={className}>
      {children}
    </motion.div>
  );
}
PageTransition.displayName = "PageTransition";

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}
export const StaggerContainer = React.memo(function StaggerContainer({
  children,
  className = "",
  delay = 0.05,
}: StaggerContainerProps) {
  const staggerProps = getStaggerProps("staggerContainer");
  const variants = staggerProps.variants as any;
  if (variants.visible?.transition) {
    variants.visible.transition.staggerChildren = delay;
  }

  return (
    <motion.div {...staggerProps} className={className}>
      {children}
    </motion.div>
  );
});

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}
export const StaggerItem = React.memo(function StaggerItem({
  children,
  className = "",
}: StaggerItemProps) {
  return (
    <motion.div {...getAnimationProps("slideUpItem")} className={className}>
      {children}
    </motion.div>
  );
});
