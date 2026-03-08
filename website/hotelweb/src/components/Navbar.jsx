import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Calendar, Menu, X, User } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Pages that have a dark hero background at the top
  const isHeroPage = ['/', '/about', '/rooms', '/restaurant', '/contact', '/activities'].includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showSolidNavbar = isScrolled || !isHeroPage;

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${showSolidNavbar ? 'bg-white shadow-[0_4px_20px_rgb(0,0,0,0.05)] py-4' : 'bg-transparent py-6 lg:py-8'}`}>
        <div className="max-w-[95rem] mx-auto px-6 md:px-12 xl:px-24 flex items-center justify-between">
          
          {/* Logo */}
          <NavLink to="/" onClick={closeMenu} className="flex items-center gap-2 z-50">
            <span className={`text-2xl md:text-3xl font-serif tracking-wide transition-colors ${showSolidNavbar ? 'text-chalet-dark' : 'text-white'}`}>
              Grand<span className="text-chalet-gold italic font-light ml-1">Hotel</span>
            </span>
          </NavLink>

          {/* Nav Container */}
          <div className="flex items-center gap-6 lg:gap-10 xl:gap-12 z-50">
            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-6 lg:gap-8 xl:gap-10">
              <NavLink to="/about" className={`font-sans text-[13px] uppercase tracking-[0.12em] font-bold transition-colors ${showSolidNavbar ? 'text-[#4A4A4A] hover:text-chalet-dark' : 'text-white hover:opacity-80 drop-shadow-md'}`}>
                About
              </NavLink>
              <NavLink to="/rooms" className={`font-sans text-[13px] uppercase tracking-[0.12em] font-bold transition-colors ${showSolidNavbar ? 'text-[#4A4A4A] hover:text-chalet-dark' : 'text-white hover:opacity-80 drop-shadow-md'}`}>
                Rooms
              </NavLink>
              <NavLink to="/restaurant" className={`font-sans text-[13px] uppercase tracking-[0.12em] font-bold transition-colors ${showSolidNavbar ? 'text-[#4A4A4A] hover:text-chalet-dark' : 'text-white hover:opacity-80 drop-shadow-md'}`}>
                Restaurant
              </NavLink>
              <NavLink to="/contact" className={`font-sans text-[13px] uppercase tracking-[0.12em] font-bold transition-colors ${showSolidNavbar ? 'text-[#4A4A4A] hover:text-chalet-dark' : 'text-white hover:opacity-80 drop-shadow-md'}`}>
                Contact
              </NavLink>
              <NavLink to="/profile" className={`font-sans text-[13px] uppercase tracking-[0.12em] font-bold transition-colors flex items-center gap-1.5 ${showSolidNavbar ? 'text-chalet-gold hover:text-chalet-dark' : 'text-chalet-gold hover:text-white drop-shadow-md'}`}>
                <User className="w-4 h-4" />
                My Profile
              </NavLink>
              {localStorage.getItem('guestData') && (
                <NotificationBell showSolidNavbar={showSolidNavbar} />
              )}
            </div>

            {/* Desktop Action Button */}
            <Link
              to="/rooms"
              className={`hidden lg:flex items-center gap-2.5 px-6 py-3 rounded-xl text-[13px] uppercase tracking-[0.12em] font-sans font-bold transition-all shadow-lg border ${
                showSolidNavbar 
                  ? 'bg-[#EFEFEF] text-chalet-dark hover:bg-[#E5E5E5] border-transparent' 
                  : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30 border-white/20'
              }`}
            >
              <Calendar className="w-5 h-5 stroke-[2px]" />
              Reservation
            </Link>

            {/* Mobile Actions */}
            <Link
              to="/rooms"
              className={`lg:hidden flex items-center justify-center p-2.5 rounded-lg transition-all shadow-lg border ${
                showSolidNavbar 
                  ? 'bg-[#EFEFEF] text-chalet-dark border-transparent' 
                  : 'bg-white/20 backdrop-blur-md text-white border-white/20'
              }`}
              aria-label="Reservation"
            >
              <Calendar className="w-5 h-5" />
            </Link>
            
            <button
              onClick={toggleMenu}
              className={`lg:hidden p-2 transition-colors focus:outline-none ${showSolidNavbar ? 'text-chalet-dark' : 'text-white drop-shadow-md'}`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/95 z-40 flex flex-col items-center justify-center transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="flex flex-col items-center gap-8 px-6 text-center w-full max-w-sm">
          <NavLink to="/about" onClick={closeMenu} className="text-xl font-sans font-bold tracking-wide text-white hover:text-chalet-gold transition-colors">
            About
          </NavLink>
          <NavLink to="/rooms" onClick={closeMenu} className="text-xl font-sans font-bold tracking-wide text-white hover:text-chalet-gold transition-colors">
            Rooms
          </NavLink>
          <NavLink to="/restaurant" onClick={closeMenu} className="text-xl font-sans font-bold tracking-wide text-white hover:text-chalet-gold transition-colors">
            Restaurant
          </NavLink>
          <NavLink to="/contact" onClick={closeMenu} className="text-xl font-sans font-bold tracking-wide text-white hover:text-chalet-gold transition-colors">
            Contact
          </NavLink>
          <NavLink to="/profile" onClick={closeMenu} className="text-xl font-sans font-bold tracking-wide text-chalet-gold hover:text-white transition-colors flex items-center gap-2">
            <User className="w-5 h-5" />
            My Profile
          </NavLink>
          
          <div className="w-24 h-px bg-white/20 my-4"></div>
          
          <Link
            to="/rooms"
            onClick={closeMenu}
            className="flex items-center justify-center gap-3 w-full py-5 mt-2 bg-white/10 backdrop-blur-md rounded-xl text-white text-lg font-sans font-bold hover:bg-white/20 transition-colors border border-white/20"
          >
            <Calendar className="w-5 h-5 stroke-[2px]" />
            Reservation
          </Link>
        </div>
      </div>
    </>
  );
}
