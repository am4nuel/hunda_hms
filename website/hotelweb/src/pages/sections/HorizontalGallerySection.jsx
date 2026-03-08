import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function HorizontalGallerySection() {
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

  return (
    <section ref={containerRef} className="relative h-[250vh] bg-white">
      <div className="sticky top-0 h-screen w-full flex flex-col lg:flex-row overflow-hidden pt-[80px]">
        {/* Left Side: Content */}
        <div className="w-full lg:w-[45%] h-[40vh] lg:h-full flex flex-col justify-center px-6 md:px-12 xl:px-24 shrink-0 relative z-10 bg-white lg:bg-transparent">
          <p className="text-[#C3A370] text-[10px] md:text-xs font-sans font-bold tracking-[0.3em] uppercase mb-4 md:mb-6">
            Welcome
          </p>
          <div className="relative w-max">
            <h2 className="text-4xl md:text-5xl lg:text-5xl xl:text-[3.5rem] font-serif text-[#3C3733] mb-6 md:mb-8 leading-[1.1]">
              Grand Hotel<br/>Lomnica
            </h2>
            {/* Dot decal */}
            <div className="absolute top-0 -right-16 hidden md:grid grid-cols-4 gap-3 opacity-30 mt-[-20px]">
              {[...Array(12)].map((_, i) => <div key={i} className="w-[4px] h-[4px] bg-[#C3A370] rounded-full" />)}
            </div>
          </div>
          <p className="text-[#7A7571] text-base md:text-[17px] font-light leading-[1.8] mb-10 max-w-lg">
            In the heart of the picturesque village of Veľká Lomnica, a private chalet awaits you, where the comfort of modern living combines with a cozy mountain atmosphere. Ideal for families, friends and corporate teams - with a capacity of up to 12 people, a wellness area, a wine cellar and a games room. Year-round operation and excellent location make it a perfect place for relaxation and active holidays.
          </p>
          <Link
            to="/rooms"
            className="w-max px-8 py-4 bg-[#3C3733] text-white font-sans text-[11px] md:text-[13px] uppercase tracking-[0.15em] font-semibold rounded-xl hover:bg-[#2A2624] transition-colors shadow-md text-center"
          >
            Book your stay
          </Link>
        </div>

        {/* Right Side: Horizontal Scrolling Gallery */}
        <div className="w-full lg:w-[55%] h-[60vh] lg:h-full flex items-center overflow-hidden shrink-0 pb-12 lg:pb-0 relative z-0">
          <div 
            ref={trackRef}
            className="flex gap-4 md:gap-6 px-6 lg:px-0 h-[85%] lg:h-[70vh] items-center"
            style={{ willChange: 'transform' }}
          >
            {/* Central large image */}
            <div className="h-full w-[85vw] lg:w-[45vw] lg:min-w-[650px] shrink-0 rounded-[2rem] overflow-hidden shadow-sm">
              <img 
                src="https://images.unsplash.com/photo-1588880331179-bc9b93a8cb65?w=1600&q=80" 
                alt="Chalet Exterior" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Grid of smaller images */}
            <div className="h-full w-[82vw] lg:w-[32vw] lg:min-w-[450px] shrink-0 grid grid-rows-3 gap-4 md:gap-6">
              <div className="row-span-2 w-full h-full rounded-[2rem] overflow-hidden shadow-sm">
                <img 
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80" 
                  alt="Interior" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="row-span-1 w-full h-full flex gap-4 md:gap-6">
                <div className="flex-1 rounded-[2rem] overflow-hidden shadow-sm">
                  <img 
                    src="https://images.unsplash.com/photo-1556910103-1c02745a872f?w=800&q=80" 
                    alt="Kitchen" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 rounded-[2rem] overflow-hidden shadow-sm">
                  <img 
                    src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80" 
                    alt="Bedroom" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

             {/* Additional image */}
             <div className="h-full w-[75vw] lg:w-[38vw] lg:min-w-[550px] shrink-0 rounded-[2rem] overflow-hidden shadow-sm mr-6 lg:mr-24">
              <img 
                src="https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80" 
                alt="Room Detail" 
                className="w-full h-full object-cover"
              />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
