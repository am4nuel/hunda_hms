import { MapPin, Phone, Mail, Clock, Send, Calendar } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* 1. Hero Section */}
      <section 
        className="relative h-[50vh] flex flex-col justify-center items-center text-center px-6 overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=1600&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 max-w-4xl">
          <p className="text-[#C3A370] text-[11px] md:text-sm font-sans tracking-[0.3em] font-bold uppercase mb-4">
            Get in touch
          </p>
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-6">Contact Us</h1>
          <div className="w-20 h-1 bg-[#C3A370] mx-auto rounded-full" />
        </div>
      </section>

      {/* 2. Contact Content */}
      <section className="py-24 px-6 md:px-12 xl:px-24">
        <div className="max-w-[95rem] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          
          {/* Left Side: Contact Info */}
          <div className="flex flex-col gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif text-[#3C3733] mb-8">Visit our premium chalet</h2>
              <p className="text-[#7A7571] text-lg font-light leading-relaxed mb-10">
                Whether you have a question about booking, our wellness facilities, or corporate events, our team is here to help you plan the perfect Tatra getaway.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FAF8F5] flex items-center justify-center shrink-0 shadow-sm border border-[#C3A370]/20">
                  <MapPin className="w-5 h-5 text-[#C3A370]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-[#3C3733] mb-2">Location</h3>
                  <p className="text-[#7A7571] font-light leading-relaxed">
                    Tatranská Lomnica 123<br />
                    059 60 Vysoké Tatry<br />
                    Slovakia
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FAF8F5] flex items-center justify-center shrink-0 shadow-sm border border-[#C3A370]/20">
                  <Phone className="w-5 h-5 text-[#C3A370]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-[#3C3733] mb-2">Phone</h3>
                  <a href="tel:+421900000000" className="text-[#7A7571] font-light hover:text-[#C3A370] transition-colors leading-relaxed">
                    +421 900 000 000
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FAF8F5] flex items-center justify-center shrink-0 shadow-sm border border-[#C3A370]/20">
                  <Mail className="w-5 h-5 text-[#C3A370]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-[#3C3733] mb-2">Email</h3>
                  <a href="mailto:info@grandhotel.sk" className="text-[#7A7571] font-light hover:text-[#C3A370] transition-colors leading-relaxed">
                    info@grandhotel.sk
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FAF8F5] flex items-center justify-center shrink-0 shadow-sm border border-[#C3A370]/20">
                  <Clock className="w-5 h-5 text-[#C3A370]" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-[#3C3733] mb-2">Availability</h3>
                  <p className="text-[#7A7571] font-light leading-relaxed">
                    Daily 08:00 - 20:00
                  </p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="mt-8 rounded-[2rem] overflow-hidden grayscale contrast-125 border border-[#FAF8F5] shadow-sm h-[300px]">
              <img 
                src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=1200&q=80" 
                alt="Map location" 
                className="w-full h-full object-cover opacity-80"
              />
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="bg-[#FAF8F5] rounded-[3rem] p-8 md:p-12 shadow-sm border border-[#E9E4DE]">
            <h2 className="text-3xl font-serif text-[#3C3733] mb-8">Send us a message</h2>
            <form className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] uppercase tracking-[0.15em] font-sans font-bold text-[#3C3733]">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    className="bg-white border border-[#E9E4DE] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C3A370]/20 transition-all font-sans"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] uppercase tracking-[0.15em] font-sans font-bold text-[#3C3733]">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="john@example.com" 
                    className="bg-white border border-[#E9E4DE] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C3A370]/20 transition-all font-sans"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] uppercase tracking-[0.15em] font-sans font-bold text-[#3C3733]">Subject</label>
                <select className="bg-white border border-[#E9E4DE] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C3A370]/20 transition-all font-sans appearance-none">
                  <option>General Inquiry</option>
                  <option>Reservation Question</option>
                  <option>Corporate Event</option>
                  <option>Wellness & Spa</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] uppercase tracking-[0.15em] font-sans font-bold text-[#3C3733]">Your Message</label>
                <textarea 
                  rows={5}
                  placeholder="Tell us how we can help..."
                  className="bg-white border border-[#E9E4DE] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#C3A370]/20 transition-all font-sans resize-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-[#3C3733] text-white font-sans text-[13px] uppercase tracking-[0.15em] font-bold py-5 rounded-xl hover:bg-[#2A2624] transition-all shadow-md flex items-center justify-center gap-3 mt-4"
              >
                Send Message
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* 3. CTA Footer Banner */}
      <section className="py-24 px-6 md:px-12 xl:px-24">
        <div className="max-w-[95rem] mx-auto bg-[#3C3733] rounded-[3rem] p-12 md:p-20 relative overflow-hidden flex flex-col items-center text-center shadow-xl">
           <div className="absolute top-12 right-12 md:grid grid-cols-3 gap-4 opacity-50 hidden">
              {[...Array(18)].map((_, i) => <div key={i} className="w-[5px] h-[5px] bg-[#7A7571] rounded-full" />)}
           </div>
           <h2 className="text-4xl md:text-5xl font-serif text-white mb-8 leading-tight">
             Experience the magic of the High Tatras
           </h2>
           <button className="bg-white text-[#3C3733] font-bold font-sans text-[13px] uppercase tracking-[0.15em] px-12 py-5 rounded-xl shadow-md hover:bg-gray-100 transition-colors flex items-center gap-3">
             Check availability
             <Calendar className="w-5 h-5" />
           </button>
        </div>
      </section>
    </div>
  );
}
