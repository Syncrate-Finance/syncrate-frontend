import Image from 'next/image'

export default function HowItWorks() {
  return (
    <section className="w-full max-w-4xl mx-auto px-6 py-12 flex flex-col items-center justify-center">
      
      {/* Full Bleed Card Container (Padding removed: p-0) */}
      <div className="w-full max-w-2xl bg-[#111111] rounded-3xl border border-[#222222] p-0 flex items-center justify-center overflow-hidden shadow-4xl">
        {/* Set aspect ratio to perfectly fit the image dimension */}
        <div className="relative w-full aspect-[1179/1479]">
          <Image
            src="/ui-mock.jpg" 
            alt="Syncrate Vault Interface Mockup"
            fill
            className="object-cover" 
            priority
          />
        </div>
      </div>

    </section> // <-- Added missing closing tag
  )
}
