import Image from 'next/image';

const steps = [
  '/step1.PNG',
  '/step2.PNG',
  '/step3.PNG',
];

export default function HowItWorks() {
  return (
    <section className="w-full max-w-4xl mx-auto px-6 py-24 flex flex-col items-center">
      
      {/* Optional Heading - Remove if you want absolutely zero text */}
      <h2 className="text-3xl md:text-4xl font-normal tracking-tight text-white mb-20 text-center">
        How it works
      </h2>

      {/* Stacking Cards Container */}
      <div className="w-full relative flex flex-col">
        {steps.map((src, index) => (
          <div
            key={index}
            // `sticky top-24` locks the card to the screen
            // `aspect-[1200/1081]` forces the exact image dimensions you requested
            // `mb-[70vh]` creates the long scroll gap before the next card slides up
            className="sticky top-24 w-full aspect-[1200/1081] rounded-[32px] overflow-hidden border border-[#222222] bg-[#030303] shadow-[0_-10px_40px_rgba(0,0,0,0.6)] mb-[70vh] last:mb-32"
          >
            <Image
              src={src}
              alt={`Step ${index + 1}`}
              fill
              priority={index === 0} // Loads the first image instantly
              className="object-cover"
            />
          </div>
        ))}
      </div>
      
    </section>
  );
}
