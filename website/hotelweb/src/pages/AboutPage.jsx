import { Users, MountainSnow, Flower2, Heart, Trees } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFB] font-sans">
      {/* 1. Hero Section */}
      <section 
        className="relative h-[65vh] flex flex-col justify-center px-6 md:px-12 xl:px-24 overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=1600&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-[95rem] mx-auto w-full">
          <p className="text-white/80 text-[11px] md:text-sm font-sans tracking-[0.3em] font-bold uppercase mb-4">
            Our Story
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-tight mb-8">
            Privacy in the heart<br />of the Tatras
          </h1>
          <div className="w-32 h-1 bg-[#C3A370] rounded-full" />
        </div>
      </section>

      {/* 2. Intro Text */}
      <section className="py-24 px-6 md:px-12 xl:px-24">
        <div className="max-w-[95rem] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-1 hidden lg:block">
            {/* Dot Matrix Vertical */}
            <div className="grid grid-cols-2 gap-3 opacity-20">
               {[...Array(20)].map((_, i) => <div key={i} className="w-[5px] h-[5px] bg-[#3C3733] rounded-full" />)}
            </div>
          </div>
          <div className="lg:col-span-6">
            <h2 className="text-4xl md:text-5xl font-serif text-[#3C3733] mb-8 leading-tight">
              A private retreat for moments that matter
            </h2>
            <div className="flex flex-col gap-6 text-[#7A7571] text-[18px] font-light leading-relaxed">
              <p>
                In the picturesque village of Veľká Lomnica, we have created a space where modern luxury meets the timeless tranquility of the High Tatras. Our Grand Hotel is not just a destination; it is a sanctuary designed for families, friends, and teams who seek both privacy and premium service.
              </p>
              <p>
                Every detail of the chalet—from the custom wooden finishes to the state-of-the-art wellness area—has been carefully curated to provide an atmosphere of warmth and exclusive comfort. With a capacity for 12 guests, we offer the rare combination of shared spaces for bonding and private corners for reflection.
              </p>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl h-[500px]">
              <img 
                src="https://images.unsplash.com/photo-1588880331179-bc9b93a8cb65?w=1200&q=80" 
                alt="Chalet architecture" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Values / Lifestyle Boxes */}
      <section className="py-24 bg-[#FAF8F5] px-6 md:px-12 xl:px-24">
        <div className="max-w-[95rem] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                icon: MountainSnow, 
                title: "Prime Location", 
                text: "Ideally situated for year-round exploration, from the slopes of Lomnický stit to the thermal waters of Poprad." 
              },
              { 
                icon: Flower2, 
                title: "Pure Wellness", 
                text: "Relieve stress in our private Finnish sauna or relax on the terrace overlooking the majestic mountain peaks." 
              },
              { 
                icon: Heart, 
                title: "Authentic Comfort", 
                text: "Blending traditional mountain materials with modern smart-home features for a effortless luxury experience." 
              }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-8 shadow-sm border border-[#E9E4DE]">
                  <item.icon className="w-8 h-8 text-[#C3A370] stroke-[1.2]" />
                </div>
                <h3 className="text-2xl font-serif text-[#3C3733] mb-4">{item.title}</h3>
                <p className="text-[#7A7571] font-light leading-relaxed max-w-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Large Feature Image Section */}
      <section className="py-24 px-6 md:px-12 xl:px-24">
        <div className="max-w-[95rem] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 relative rounded-[3rem] overflow-hidden shadow-xl aspect-square lg:aspect-video">
             <img 
               src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80" 
               alt="Interior design" 
               className="w-full h-full object-cover"
             />
          </div>
          <div className="order-1 lg:order-2 lg:pl-12">
            <Trees className="w-12 h-12 text-[#C3A370] mb-8" />
            <h2 className="text-4xl font-serif text-[#3C3733] mb-8">Sustainable Elegance</h2>
            <p className="text-[#7A7571] text-lg font-light leading-relaxed mb-8">
              We believe in living in harmony with the environment that inspires us. Our property utilizes smart energy solutions and locally sourced materials wherever possible, ensuring your stay leaves nothing but beautiful memories.
            </p>
            <div className="flex gap-10">
              <div>
                <span className="block text-4xl font-serif text-[#C3A370] mb-1">12</span>
                <span className="text-[11px] uppercase tracking-[0.15em] font-sans font-bold text-[#3C3733]/60">Max Guests</span>
              </div>
              <div>
                <span className="block text-4xl font-serif text-[#C3A370] mb-1">240m²</span>
                <span className="text-[11px] uppercase tracking-[0.15em] font-sans font-bold text-[#3C3733]/60">Living Space</span>
              </div>
              <div>
                <span className="block text-4xl font-serif text-[#C3A370] mb-1">★★★★★</span>
                <span className="text-[11px] uppercase tracking-[0.15em] font-sans font-bold text-[#3C3733]/60">Standard</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
