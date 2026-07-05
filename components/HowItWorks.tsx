'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

const steps = [
  {
    id: '01',
    title: 'Deposit USDC',
    description: 'Provide liquidity by depositing USDC into our audited smart contracts to begin earning yield immediately.',
    image: '/step1.png'
  },
  {
    id: '02',
    title: 'Gold financed via GoldBod',
    description: 'Your capital is seamlessly routed through the GoldBod aggregator to finance physical gold operations.',
    image: '/step2.png'
  },
  {
    id: '03',
    title: 'Redeem USDS anytime',
    description: 'Maintain full control of your capital. Burn your position and redeem USDS whenever you choose.',
    image: '/step3.png'
  }
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // This observer tracks when a text step hits the middle of the screen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setActiveStep(index);
          }
        });
      },
      { rootMargin: '-50% 0px -50% 0px' } 
    );

    stepRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-32 border-t border-[#111111]">
      <div className="mb-16 md:mb-24">
        <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-white mb-4">How it works</h2>
        <p className="text-[#888888] text-base">From stablecoin to physical asset yield in four steps.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-12 relative">
        
        {/* Left Side: Scrollable Text Steps */}
        <div className="w-full md:w-1/2 flex flex-col md:pt-[10vh] md:pb-[30vh]">
          {steps.map((step, index) => (
            <div
              key={step.id}
              ref={(el: HTMLDivElement | null) => { stepRefs.current[index] = el; }}
              data-index={index}
              className={`md:min-h-[50vh] mb-16 md:mb-0 flex flex-col justify-center transition-opacity duration-500 ${
                activeStep === index ? 'opacity-100' : 'md:opacity-30'
              }`}
            >
              <span className="text-[#555555] font-mono text-sm mb-4">{step.id}</span>
              <h3 className="text-2xl font-normal text-white mb-4">{step.title}</h3>
              <p className="text-[#888888] text-base leading-relaxed max-w-sm">
                {step.description}
              </p>

              {/* Mobile Image Fallback: Shows under text on small screens only */}
              <div className="md:hidden w-full h-[250px] relative mt-8 rounded-[24px] overflow-hidden bg-[#161616]">
                <Image src={step.image} alt={step.title} fill className="object-cover" />
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Sticky Image Container (Desktop Only) */}
        <div className="hidden md:block w-full md:w-1/2 sticky top-32 h-[500px] bg-[#161616] rounded-[32px] overflow-hidden border border-[#222222]">
          {steps.map((step, index) => (
            <Image
              key={step.id}
              src={step.image}
              alt={step.title}
              fill
              className={`object-cover transition-opacity duration-700 ease-in-out ${
                activeStep === index ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
