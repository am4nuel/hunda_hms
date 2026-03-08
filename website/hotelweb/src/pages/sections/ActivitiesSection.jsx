import { MapPin } from 'lucide-react';

export default function ActivitiesSection() {
  return (
    <section id="activities" className="py-24 md:py-32 bg-[#FDFDFB] px-6">
      <div className="max-w-[100rem] mx-auto text-center">
        <h2 className="text-4xl md:text-5xl lg:text-[4rem] font-serif text-[#3C3733] mb-12">Experiences in the heart of the Tatras</h2>
        
        {/* Main Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-15 gap-6 items-start text-left">
          
          {/* 1st Column (Left side) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <div className="relative h-[450px] rounded-[2rem] overflow-hidden group shadow-sm">
               <img src="https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&q=80" alt="Skiing" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
               <div className="absolute top-6 left-6 flex items-center gap-2 text-white">
                 <MapPin className="w-5 h-5" />
                 <span className="text-sm font-semibold font-sans">Ski Resort</span>
               </div>
               <div className="absolute bottom-8 left-8 text-white">
                 <div className="text-[4rem] font-serif leading-none mb-2">24 km</div>
                 <div className="text-base font-sans opacity-95">of slopes</div>
               </div>
            </div>

            <div className="relative h-[250px] rounded-[2rem] overflow-hidden group shadow-sm">
               <img src="https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&q=80" alt="Aquacity Poprad" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent bg-teal-900/40 mix-blend-multiply" />
               <div className="absolute top-6 left-6 flex items-center gap-2 text-white">
                 <MapPin className="w-5 h-5" />
                 <span className="text-sm font-semibold font-sans drop-shadow-md">Aquacity Poprad</span>
               </div>
               <div className="absolute bottom-8 left-8 text-white drop-shadow-lg">
                 <div className="text-[4rem] font-serif leading-none mb-2">9 km</div>
                 <div className="text-base font-sans opacity-95">from Grand Hotel</div>
               </div>
            </div>
          </div>

          {/* Middle Section (Columns 2 & 3) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            {/* Text Block */}
            <div className="relative flex flex-col items-center justify-center text-center px-4 lg:px-12 my-6 lg:mb-12">
               <div className="absolute top-0 left-0 hidden md:grid grid-cols-4 gap-3 opacity-30 mt-8 ml-8">
                  {[...Array(12)].map((_, i) => <div key={i} className="w-[5px] h-[5px] bg-[#C3A370] rounded-full" />)}
               </div>
               <div className="absolute bottom-0 right-0 hidden md:grid grid-cols-4 gap-3 opacity-30 mb-8 mr-8">
                  {[...Array(12)].map((_, i) => <div key={i} className="w-[5px] h-[5px] bg-[#C3A370] rounded-full" />)}
               </div>

               <p className="text-[#7A7571] text-[1.1rem] font-light leading-relaxed mb-10 max-w-xl">
                 Grand Hotel is an ideal starting point for discovering the beauty of the High Tatras - regardless of the season. It is up to you whether you go on foot, by car or rent one of the e-bikes that are available to guests.
               </p>
               <button className="px-8 py-4 bg-[#4A4541] text-white font-sans text-[11px] md:text-[13px] uppercase tracking-[0.15em] font-bold rounded-xl hover:bg-[#3C3733] transition-colors shadow-md w-max">
                 Discover the surroundings
               </button>
            </div>

            {/* Treetop Walk (Spanning Columns 2 & 3) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* TreeTop Walk */}
               <div className="relative h-[350px] rounded-[2rem] overflow-hidden group shadow-sm">
                  <img src="https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=800&q=80" alt="Treetop walk" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent bg-green-900/30 mix-blend-overlay" />
                  <div className="absolute top-6 left-6 flex items-start gap-2 text-white">
                    <MapPin className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-semibold font-sans drop-shadow-md max-w-[120px] leading-tight mt-0.5">Treetop Walk</span>
                  </div>
                  <div className="absolute bottom-8 left-8 text-white drop-shadow-lg">
                    <div className="text-[4rem] font-serif leading-none mb-2">24 km</div>
                    <div className="text-base font-sans opacity-95">from Grand Hotel</div>
                  </div>
               </div>

               {/* Belianska Cave */}
               <div className="relative h-[300px] rounded-[2rem] overflow-hidden group shadow-sm mt-0 md:mt-16">
                  <img src="https://images.unsplash.com/photo-1499244571948-7cc8056028a5?w=800&q=80" alt="Belianska cave" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent bg-orange-900/30 mix-blend-overlay" />
                  <div className="absolute top-6 left-6 flex items-center gap-2 text-white">
                    <MapPin className="w-5 h-5" />
                    <span className="text-sm font-semibold font-sans drop-shadow-md">Belianska Cave</span>
                  </div>
                  <div className="absolute bottom-8 left-8 text-white drop-shadow-lg">
                    <div className="text-[4rem] font-serif leading-none mb-2">9 km</div>
                    <div className="text-base font-sans opacity-95">from Grand Hotel</div>
                  </div>
               </div>
            </div>
          </div>

          {/* 4th Column (Right side, slightly pushed down) */}
          <div className="lg:col-span-3 flex flex-col gap-6 lg:mt-24">
            <div className="relative h-[400px] rounded-[2rem] overflow-hidden group shadow-sm z-10 lg:-ml-12 lg:mb-[-100px]">
               <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80" alt="Lomnicky stit" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
               <div className="absolute top-6 left-6 flex items-center gap-2 text-white">
                 <MapPin className="w-5 h-5" />
                 <span className="text-sm font-semibold font-sans drop-shadow-md">Lomnický Peak</span>
               </div>
               <div className="absolute bottom-8 left-8 text-white drop-shadow-lg">
                 <div className="text-[4rem] font-serif leading-none mb-2">19 km</div>
                 <div className="text-base font-sans opacity-95">from Grand Hotel</div>
               </div>
            </div>

             <div className="relative h-[200px] rounded-[2rem] overflow-hidden group shadow-sm lg:mt-[100px]">
               <img src="https://images.unsplash.com/photo-1587174486073-ae5e1c070baa?w=800&q=80" alt="Golf" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent bg-[#8A7965]/40 mix-blend-multiply" />
               <div className="absolute top-6 left-6 flex items-center gap-2 text-white">
                 <MapPin className="w-5 h-5" />
                 <span className="text-sm font-semibold font-sans drop-shadow-md">Golf Black Stork</span>
               </div>
               <div className="absolute bottom-5 left-6 text-white drop-shadow-lg">
                 <div className="text-5xl font-serif mb-1">4 km</div>
                 <div className="text-sm font-sans opacity-95">from Grand Hotel</div>
               </div>
            </div>
          </div>

          {/* 5th Column (Far Right side) */}
          <div className="hidden xl:flex xl:col-span-3 flex-col gap-6 xl:mt-16">
            <div className="relative h-[400px] rounded-[2rem] overflow-hidden group shadow-sm z-0">
               <img src="https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&q=80" alt="Climbing wall" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 grayscale-[0.3]" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
               <div className="absolute top-6 left-6 flex items-center gap-2 text-white">
                 <MapPin className="w-5 h-5" />
                 <span className="text-sm font-semibold font-sans drop-shadow-md">Climbing Wall</span>
               </div>
               <div className="absolute bottom-8 left-8 text-white drop-shadow-lg">
                 <div className="text-[4rem] font-serif leading-none mb-2">9 km</div>
                 <div className="text-base font-sans opacity-95">from Grand Hotel</div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
