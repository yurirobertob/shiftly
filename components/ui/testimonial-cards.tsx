"use client";
import * as React from 'react';
import { motion } from 'framer-motion';

interface TestimonialCardProps {
  handleShuffle: () => void;
  testimonial: string;
  position: string;
  id: number;
  author: string;
  img?: string;
}

export function TestimonialCard({ handleShuffle, testimonial, position, id, author, img }: TestimonialCardProps) {
  const dragRef = React.useRef(0);
  const isFront = position === "front";
  return (
    <motion.div
      style={{ zIndex: position === "front" ? "2" : position === "middle" ? "1" : "0" }}
      animate={{
        rotate: position === "front" ? "-6deg" : position === "middle" ? "0deg" : "6deg",
        x: position === "front" ? "0%" : position === "middle" ? "33%" : "66%"
      }}
      drag={true}
      dragElastic={0.35}
      dragListener={isFront}
      dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
      onDragStart={(e: any) => { dragRef.current = e.clientX; }}
      onDragEnd={(e: any) => { if (dragRef.current - e.clientX > 150) handleShuffle(); dragRef.current = 0; }}
      transition={{ duration: 0.35 }}
      className={`absolute left-0 top-0 grid h-[450px] w-[350px] select-none place-content-center space-y-6 rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-2xl ${isFront ? "cursor-grab active:cursor-grabbing" : ""}`}
    >
      <img src={img || `https://i.pravatar.cc/128?img=${id}`} alt={`Avatar of ${author}`} className="pointer-events-none mx-auto h-28 w-28 rounded-full border-4 border-[#2463EB]/30 bg-gray-100 object-cover shadow-lg" />
      <span className="text-center text-base italic text-gray-800 leading-relaxed font-medium">&ldquo;{testimonial}&rdquo;</span>
      <span className="text-center text-sm font-bold text-[#2463EB]">{author}</span>
    </motion.div>
  );
}
