"use client";

import { motion, Variants } from "framer-motion";
import { useRef } from "react";

interface VerticalCutRevealProps {
  children: string;
  className?: string;
  delay?: number;
  duration?: number;
}

const containerVariants: Variants = {
  hidden: {},
  visible: (delay: number) => ({
    transition: {
      staggerChildren: 0.03,
      delayChildren: delay,
    },
  }),
};

const charVariants: Variants = {
  hidden: {
    y: "100%",
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.4, 0.25, 1],
    },
  },
};

export function VerticalCutReveal({
  children,
  className,
  delay = 0,
  duration,
}: VerticalCutRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const words = children.split(" ");

  return (
    <motion.span
      ref={ref}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      custom={delay}
      variants={containerVariants}
      style={{ display: "inline" }}
    >
      {words.map((word, wi) => (
        <span key={wi} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}>
          <motion.span
            variants={charVariants}
            style={{ display: "inline-block" }}
          >
            {word}
          </motion.span>
          {wi < words.length - 1 && "\u00A0"}
        </span>
      ))}
    </motion.span>
  );
}
