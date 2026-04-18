"use client";

import { motion, type Variants } from "framer-motion";
import { forwardRef, type ReactNode, type RefObject } from "react";

interface TimelineContentProps {
  animationNum: number;
  timelineRef?: RefObject<HTMLDivElement | null>;
  customVariants: Variants;
  className?: string;
  children: ReactNode;
}

export const TimelineContent = forwardRef<HTMLDivElement, TimelineContentProps>(
  ({ animationNum, timelineRef, customVariants, className, children }, ref) => {
    return (
      <motion.div
        ref={ref}
        custom={animationNum}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={customVariants}
        className={className}
      >
        {children}
      </motion.div>
    );
  }
);

TimelineContent.displayName = "TimelineContent";
