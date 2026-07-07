import Image from 'next/image'

export default function HowItWorks() {
  return (
    <section className="w-full max-w-4xl mx-auto px-6 py-12 flex flex-col items-center justify-center">
      
      {/* Clean Single UI Mockup Card Container */}
      <div className="w-full max-w-2xl bg-[#111111] rounded-3xl border border-[#222222] p-4 sm:p-8 flex items-center justify-center overflow-hidden shadow-2xl">
        <div className="relative w-full aspect-square max-w-md">
          <Image
            src="/ui-mockup.png" 
            alt="Syncrate Swap Interface Mockup"
            fill
            className="object-contain rounded-2xl"
            priority
          />
        </div>
      </div>

    </section>
  )
}
