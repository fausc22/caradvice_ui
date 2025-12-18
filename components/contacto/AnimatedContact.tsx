"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedContactProps {
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

export function AnimatedContact({
  children,
  className,
  initial,
  whileInView,
  viewport,
  transition,
  whileHover,
  whileTap,
  animate,
}: AnimatedContactProps) {
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
  target,
  rel,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  whileHover?: any;
  whileTap?: any;
  target?: string;
  rel?: string;
}) {
  return (
    <motion.a
      href={href}
      className={className}
      whileHover={whileHover}
      whileTap={whileTap}
      target={target}
      rel={rel}
    >
      {children}
    </motion.a>
  );
}

