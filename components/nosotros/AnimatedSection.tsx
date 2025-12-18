"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  initial?: any;
  whileInView?: any;
  viewport?: any;
  transition?: any;
  whileHover?: any;
}

export function AnimatedSection({
  children,
  className,
  initial,
  whileInView,
  viewport,
  transition,
  whileHover,
}: AnimatedSectionProps) {
  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={whileInView}
      viewport={viewport}
      transition={transition}
      whileHover={whileHover}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedImage({
  src,
  alt,
  className,
  whileHover,
  transition,
}: {
  src: string;
  alt: string;
  className?: string;
  whileHover?: any;
  transition?: any;
}) {
  return (
    <motion.img
      src={src}
      alt={alt}
      className={className}
      whileHover={whileHover}
      transition={transition}
    />
  );
}

export function AnimatedLink({
  href,
  children,
  className,
  whileHover,
  whileTap,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  whileHover?: any;
  whileTap?: any;
}) {
  return (
    <motion.a
      href={href}
      className={className}
      whileHover={whileHover}
      whileTap={whileTap}
    >
      {children}
    </motion.a>
  );
}

