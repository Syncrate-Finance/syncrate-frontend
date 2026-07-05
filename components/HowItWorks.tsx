'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const steps = ['/step1.PNG', '/step2.PNG', '/step3.PNG'];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const { top, height } = containerRef.current.getBoundingClientRect();
      
      // Calculate progress: how far through the section are we?
      // We divide by a smaller value (e.g., 500) so it switches faster.
      const progress = -top / 500; 
      const nextStep = Math.max(0, Math.min(steps.length - 1, Math.floor(progress)));
      
      setActiveStep(nextStep);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    // We give it a height, but since it's sticky, it won't push the footer away.
    <section ref={containerRef} className="w-full relative h-[150vh]">
      {/* 
         'sticky top-20' keeps the card in one place while the page scrolls.
         The card will stay visible under your header as shown in image_4.png and image_5.png.
      */}
      <div className="sticky top-20 w-[90%] max-w-lg mx-auto aspect-[1200/1081] rounded-[32px] overflow-hidden border border-[#222222] bg-[#030303] shadow-2xl">
        {steps.map((src, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              activeStep === index ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={src}
              alt={`Step ${index + 1}`}
              fill
              priority={index === 0}
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
