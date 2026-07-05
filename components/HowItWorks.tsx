'use client';

import { useState, useRef, TouchEvent } from 'react';
import Image from 'next/image';

const steps = ['/step1.PNG', '/step2.PNG', '/step3.PNG'];

export default function HowItWorks() {
  const [index, setIndex] = useState(0);
  const touchStart = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart.current - touchEnd;

    // Swipe left (next)
    if (diff > 50 && index < steps.length - 1) {
      setIndex(index + 1);
    }
    // Swipe right (prev)
    if (diff < -50 && index > 0) {
      setIndex(index - 1);
    }
  };

  return (
    <section className="w-full max-w-lg mx-auto px-6 py-6">
      <div 
        className="relative w-full aspect-[1200/1081] rounded-[32px] overflow-hidden border border-[#222222] bg-[#030303] shadow-2xl touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {steps.map((src, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-300 ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={src}
              alt={`Step ${i + 1}`}
              fill
              priority={i === 0}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Indicator Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {steps.map((_, i) => (
          <div 
            key={i} 
            className={`h-2 w-2 rounded-full transition-colors ${
              i === index ? 'bg-white' : 'bg-[#333333]'
            }`} 
          />
        ))}
      </div>
    </section>
  );
}
