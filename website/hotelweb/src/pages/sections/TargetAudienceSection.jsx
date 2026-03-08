import { Users, Briefcase, Heart } from 'lucide-react';

export default function TargetAudienceSection() {
  const items = [
    {
      icon: <Users className="w-8 h-8 text-[#3C3733]" strokeWidth={1.5} />,
      title: 'Families with children',
      text: 'Larger families, or several families who like to seek comfort and prefer the cozy atmosphere of a cabin, but at the same time put up with a high standard of accommodation.'
    },
    {
      icon: <Briefcase className="w-8 h-8 text-[#3C3733]" strokeWidth={1.5} />,
      title: 'Corporate events',
      text: 'Ideal space for corporate events up to 12 people, who prefer informal spaces for smaller trainings or teambuildings.'
    },
    {
      icon: <Heart className="w-8 h-8 text-[#3C3733]" strokeWidth={1.5} />,
      title: 'Friends',
      text: 'For smaller groups of up to 12 people who prefer privacy and like to seek a relaxed, homey atmosphere combined with luxury. Ideal for friends, acquaintances or ladies weekends.'
    }
  ];

  return (
    <section className="py-24 bg-white px-6">
      <div className="max-w-[95rem] mx-auto text-center">
        <h2 className="text-4xl md:text-5xl lg:text-[3.5rem] font-serif text-[#3C3733] mb-16 leading-tight">
          For families, companies and<br/>groups of friends
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {items.map((item, idx) => (
             <div key={idx} className="bg-[#FAF8F5] p-10 md:p-12 rounded-[2rem] text-left relative overflow-hidden h-full flex flex-col items-start shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute top-10 right-10 grid grid-cols-4 gap-3 opacity-30">
                  {[...Array(12)].map((_, i) => <div key={i} className="w-[4px] h-[4px] bg-[#C3A370] rounded-full" />)}
                </div>
                <div className="mb-12">
                  {item.icon}
                </div>
                <h3 className="text-3xl font-serif text-[#3C3733] mb-6">{item.title}</h3>
                <p className="text-[#7A7571] leading-[1.8] font-light">{item.text}</p>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}
