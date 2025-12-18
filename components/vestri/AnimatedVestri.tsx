"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedVestriProps {
  children: ReactNode;
  className?: string;
  initial?: any;
  whileInView?: any;
  viewport?: any;
  transition?: any;
  whileHover?: any;
  whileTap?: any;
  animate?: any;
}

export function AnimatedVestri({
  children,
  className,
  initial,
  whileInView,
  viewport,
  transition,
  whileHover,
  whileTap,
  animate,
}: AnimatedVestriProps) {
  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={whileInView}
      viewport={viewport}
      transition={transition}
      whileHover={whileHover}
      whileTap={whileTap}
      animate={animate}
    >
      {children}
    </motion.div>
  );
}

