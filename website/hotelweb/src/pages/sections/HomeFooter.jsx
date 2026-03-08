import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function HomeFooter() {
  return (
    <footer className="bg-chalet-dark text-white/70 pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 mb-16 border-b border-white/10 pb-16">
        <div>
          <span className="text-3xl font-serif text-white tracking-wide block mb-6">Grand<span className="text-chalet-gold italic">Hotel</span></span>
          <p className="text-sm font-light leading-relaxed max-w-xs text-white/60">
            Experience the pinnacle of hospitality. Your premium getaway awaits under the stars.
          </p>
        </div>
        <div>
          <h4 className="font-sans font-semibold text-white tracking-[0.2em] uppercase mb-8 text-xs">Contact Us</h4>
          <ul className="space-y-6 text-sm font-light">
            <li className="flex items-center gap-4"><MapPin className="w-5 h-5 text-chalet-gold shrink-0" /> 123 Luxury Ave, Resort Town</li>
            <li className="flex items-center gap-4"><Phone className="w-5 h-5 text-chalet-gold shrink-0" /> +1 234 567 890</li>
            <li className="flex items-center gap-4"><Mail className="w-5 h-5 text-chalet-gold shrink-0" /> info@grandhotel.com</li>
          </ul>
        </div>
        <div>
          <h4 className="font-sans font-semibold text-white tracking-[0.2em] uppercase mb-8 text-xs">Quick Links</h4>
          <ul className="space-y-4 text-sm font-light">
            <li><Link to="/rooms" className="hover:text-chalet-gold transition-colors block">Rooms & Suites</Link></li>
            <li><Link to="/restaurant" className="hover:text-chalet-gold transition-colors block">Restaurant</Link></li>
            <li><Link to="/contact" className="hover:text-chalet-gold transition-colors block">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto text-center text-xs tracking-wider text-white/40">
        <p>© {new Date().getFullYear()} Grand Hotel. All rights reserved.</p>
      </div>
    </footer>
  );
}
