import { Link } from 'react-router-dom';
import { Users, Flower2, Wifi, MountainSnow, Calendar } from 'lucide-react';

export default function HeroSection() {
  return (
    <section
      className="relative h-screen flex flex-col justify-end pt-32 pb-6 px-6 md:px-12 xl:px-24 overflow-hidden"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      
      {/* Left Dot Matrix */}
      <div className="absolute top-[28%] left-12 lg:left-32 hidden lg:grid grid-cols-4 gap-x-6 gap-y-7 opacity-30 z-0">
        {[...Array(12)].map((_, i) => <div key={i} className="w-[5px] h-[5px] bg-white rounded-full" />)}
      </div>

      {/* Right Dot Matrix */}
      <div className="absolute top-[26%] right-10 lg:right-24 hidden lg:grid grid-cols-4 gap-x-6 gap-y-7 opacity-30 z-0">
        {[...Array(32)].map((_, i) => <div key={i} className="w-[5px] h-[5px] bg-white rounded-full" />)}
      </div>

      <div className="relative z-10 w-full max-w-[95rem] mx-auto flex flex-col items-start mt-auto mb-[5vh] lg:mb-[8vh]">
        <p className="text-white text-[11px] md:text-sm font-sans tracking-[0.25em] font-bold uppercase mb-4 md:mb-6 drop-shadow-md lg:ml-[2px]">
          Relaxation. Experiences. Privacy.
        </p>
        <h1 className="text-[2.5rem] md:text-[4rem] lg:text-[5.5rem] font-serif text-white leading-[1.05] tracking-tight mb-8 md:mb-12 drop-shadow-xl max-w-[55rem]">
          Premium chalet under the Tatras<br className="hidden md:block"/> for families and businesses
        </h1>
        
        <div className="flex flex-wrap gap-4 md:gap-5">
          <Link to="/rooms" className="flex items-center gap-3 px-6 py-3.5 md:px-8 md:py-4 bg-white/20 backdrop-blur-md text-white font-sans text-[11px] md:text-[13px] uppercase tracking-[0.15em] font-bold hover:bg-white/30 transition-colors rounded-xl border border-white/20 shadow-lg">
            Reservation Date
            <Calendar className="w-4 h-4 md:w-5 md:h-5 stroke-[2px]" />
          </Link>
          <Link to="/rooms" className="px-8 py-3.5 md:px-10 md:py-4 bg-white text-chalet-dark font-sans text-[11px] md:text-[13px] uppercase tracking-[0.15em] font-bold shadow-lg hover:bg-gray-100 transition-colors rounded-xl text-center">
            Book Now
          </Link>
        </div>
      </div>

      {/* Bottom Bar overlay */}
      <div className="relative z-10 w-full max-w-[95rem] mx-auto border-t border-white/20 pt-5 md:pt-7 flex flex-col xl:flex-row items-center xl:items-start justify-between gap-6 md:gap-8 lg:pb-3">
        <p className="text-white font-sans text-[12px] md:text-[13px] uppercase tracking-[0.15em] font-bold shrink-0 text-center xl:text-left pt-2 md:pt-3">
          Experience the benefits of staying with us
        </p>
        <div className="flex flex-wrap lg:flex-nowrap gap-x-6 gap-y-6 md:gap-x-12 md:gap-y-8 justify-center xl:justify-end xl:w-auto">
          {[
            { icon: Users, text: "Chalet capacity\nup to 12 people" },
            { icon: Flower2, text: "Wellness area with\nsauna and massages" },
            { icon: Wifi, text: "Smart equipment\nand fast Wi-Fi" },
            { icon: MountainSnow, text: "Privacy with a\nview of the Tatras" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 md:gap-4 text-white hover:opacity-80 transition-opacity cursor-pointer">
              <div className="w-10 h-10 md:w-[46px] md:h-[46px] rounded-full border border-white/20 flex items-center justify-center shrink-0 bg-white/10 backdrop-blur-md shadow-sm">
                <item.icon className="w-4 h-4 md:w-5 md:h-5 text-white stroke-[1.5]" />
              </div>
              <p className="text-[10px] md:text-[11px] uppercase tracking-[0.12em] font-sans font-bold leading-tight whitespace-pre-line drop-shadow-md text-white/95">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
