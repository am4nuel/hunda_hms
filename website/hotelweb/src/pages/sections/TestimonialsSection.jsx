import { useRef, useEffect } from 'react';

export default function TestimonialsSection() {
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !trackRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const maxScroll = rect.height - windowHeight;
      const scrollY = -rect.top;
      
      if (scrollY >= 0 && scrollY <= maxScroll) {
        const maxTranslate = trackRef.current.scrollWidth - trackRef.current.parentElement.clientWidth;
        const progress = scrollY / maxScroll;
        trackRef.current.style.transform = `translateX(-${progress * maxTranslate}px)`;
      } else if (scrollY < 0) {
        trackRef.current.style.transform = `translateX(0px)`;
      } else if (scrollY > maxScroll) {
        const maxTranslate = trackRef.current.scrollWidth - trackRef.current.parentElement.clientWidth;
        trackRef.current.style.transform = `translateX(-${maxTranslate}px)`;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const testimonials = [
    {
      text: "We spent a wonderful time at the chalet with friends and family. Reality exceeded our high expectations. A beautiful, bright, and above all, clean chalet with amazing views in a quiet environment. Children were entertained both inside and outside. The chalet is excellently equipped, and nothing was missing for our satisfaction. We are already looking forward to our next possible vacation in this magical place. Thank you! (August 2025)",
      author: "STANISLAVA - PASCHING, AT"
    },
    {
      text: "The chalet was a great place for my 50th birthday celebration. We had privacy, beautiful surroundings, perfect equipment, and enough space for the whole family. The evening by the grill with a view of the Tatras was unforgettable.",
      author: "MÁRIA, NOVÁ BAŇA"
    },
    {
      text: "The chalet has everything we needed. We felt right at home, just in more beautiful surroundings.",
      author: "MILAN, BANSKÁ BYSTRICA"
    },
    {
      text: "We fell in love with the chalet from the first moment. The children played outside all day, while the adults relaxed on the terrace with a beer we tapped ourselves. We liked it very much and have many beautiful memories.",
      author: "JÁN, POPRAD"
    },
    {
      text: "A perfect family gathering. The atmosphere was cozy, and the amenities were top-notch. Highly recommended for any group looking for a premium experience under the mountains.",
      author: "ANDREA, BRATISLAVA"
    }
  ];

  return (
    <section ref={containerRef} className="relative h-[400vh] bg-[#FAF8F5]">
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden">
        <div className="max-w-[95rem] mx-auto px-6 mb-12 w-full">
          <h2 className="text-4xl md:text-5xl lg:text-[4rem] font-serif text-[#3C3733] text-center">
            What our guests say
          </h2>
        </div>

        <div className="w-full overflow-hidden">
          <div 
            ref={trackRef}
            className="flex gap-6 md:gap-8 px-6 md:px-24 items-stretch"
            style={{ willChange: 'transform' }}
          >
            {testimonials.map((item, idx) => (
              <div 
                key={idx} 
                className="w-[85vw] md:w-[450px] shrink-0 bg-white p-6 md:p-8 rounded-[1rem] shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 bg-[#FAF8F5] rounded-full flex items-center justify-center mb-6">
                    <span className="text-xl font-serif text-[#C3A370]">“</span>
                  </div>
                  <p className="text-[#3C3733] text-lg font-light leading-relaxed mb-8">
                    {item.text}
                  </p>
                </div>
                <p className="text-[#3C3733]/60 font-sans text-xs font-bold tracking-widest uppercase">
                  {item.author}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
