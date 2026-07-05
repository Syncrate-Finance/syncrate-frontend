import Image from 'next/image';

const steps = [
  '/step1.PNG',
  '/step2.PNG',
  '/step3.PNG',
];

export default function HowItWorks() {
  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-12 flex flex-col items-center">


      {/* Stacking Cards Container */}
      <div className="w-full relative flex flex-col items-center">
        {steps.map((src, index) => (
          <div
            key={index}
            // `top-[15vh]` pushes it down slightly from the top of the screen so it breathes.
            // `w-[90%] max-w-lg md:max-w-xl` shrinks the width, which reduces the height so it doesn't eat the whole screen.
            // `mb-[30vh]` makes the scroll snappy and fast. (Applied to all, including the last one, so it stays stacked!)
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
