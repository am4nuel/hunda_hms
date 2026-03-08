import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';

export default function AvailabilitySection() {
  return (
    <section id="reservation" className="py-24 bg-white px-6">
       <div className="max-w-[95rem] mx-auto bg-[#3C3733] rounded-[3rem] p-12 md:p-20 relative overflow-hidden flex flex-col items-center text-center shadow-xl">
          {/* Decals */}
          <div className="absolute top-12 right-12 md:grid grid-cols-3 gap-4 opacity-50 hidden">
             {[...Array(18)].map((_, i) => <div key={i} className="w-[5px] h-[5px] bg-[#7A7571] rounded-full" />)}
          </div>
          <div className="absolute bottom-12 left-12 md:grid grid-cols-4 gap-4 opacity-50 hidden">
             {[...Array(12)].map((_, i) => <div key={i} className="w-[5px] h-[5px] bg-[#7A7571] rounded-full" />)}
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-serif text-white mb-6 relative z-10 leading-[1.1]">
            Check the availability of the chalet<br/>on your date
          </h2>
          <p className="text-white/80 font-light mb-12 max-w-2xl relative z-10 text-lg">
            The minimum length of stay is 3 nights. If you are interested in a shorter stay, contact us via the form.
          </p>
          
          <div className="w-full max-w-3xl text-left relative z-10 flex flex-col gap-2 mx-auto items-center">
            <div className="w-full max-w-2xl text-left">
              <label className="text-white font-bold font-sans text-[11px] uppercase tracking-[0.15em] ml-2">Reservation Date</label>
              <div className="flex flex-col sm:flex-row gap-4 w-full mt-2">
                <div className="flex-1 bg-[#4A4541] border border-white/10 rounded-xl px-5 py-4 flex items-center justify-between cursor-text hover:bg-[#524E4A] transition-colors">
                  <span className="text-white/60 font-sans text-lg">Select date...</span>
                  <Calendar className="w-6 h-6 text-white/50" />
                </div>
                <Link to="/rooms" className="bg-white text-[#3C3733] font-bold font-sans text-[11px] md:text-[13px] uppercase tracking-[0.15em] px-12 py-4 rounded-xl shadow-md hover:bg-gray-100 transition-colors whitespace-nowrap text-center">
                  Book Now
                </Link>
              </div>
            </div>
          </div>
       </div>
    </section>
  );
}
