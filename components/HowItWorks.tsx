'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const steps = ['/step1.PNG', '/step2.PNG', '/step3.PNG'];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      // Get the position of the container relative to the viewport
      const rect = (containerRef.current as HTMLElement).getBoundingClientRect();
      const scrollProgress = -rect.top / 300;
      
      // Update the active step based on scroll depth
      const nextStep = Math.max(0, Math.min(steps.length - 1, Math.floor(scrollProgress)));
      setActiveStep(nextStep);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={containerRef} className="w-full max-w-xl mx-auto px-6 py-24 h-[300vh]">
      {/* The single display window */}
      <div className="sticky top-[20vh] w-full aspect-[1200/1081] rounded-[32px] overflow-hidden border border-[#222222] bg-[#030303] shadow-2xl">
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
