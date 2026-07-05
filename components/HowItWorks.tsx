'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const steps = ['/step1.PNG', '/step2.PNG', '/step3.PNG'];

export default function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

    useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      // Change the rootMargin: 
      // '0px 0px -40% 0px' means: don't trigger until the section 
      // has scrolled 40% up from the bottom of the screen.
      { rootMargin: '0px 0px -40% 0px', threshold: 0 } 
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={containerRef} className="w-full max-w-6xl mx-auto px-6 py-12 flex flex-col items-center">
      {/* The cards container will start at opacity-0 and fade in when scrolled */}
      <div 
        className={`w-full relative flex flex-col items-center transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      >
        {steps.map((src, index) => (
          <div
            key={index}
            className="sticky top-[15vh] md:top-[20vh] w-[90%] max-w-lg md:max-w-xl aspect-[1200/1081] rounded-[32px] overflow-hidden border border-[#222222] bg-[#030303] shadow-[0_-15px_40px_rgba(0,0,0,0.8)] mb-[15vh]"
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
