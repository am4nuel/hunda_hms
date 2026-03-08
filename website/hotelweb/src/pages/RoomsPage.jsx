import { useState, useEffect, useMemo } from 'react';
import { apiFetch } from '../lib/api';
import ReservationModal from '../components/ReservationModal';
import { Calendar, Search, ChevronRight } from 'lucide-react';

const PLACEHOLDER_ROOM_IMAGES = [
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
  'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
];

function RoomCard({ room, index, onReserve, isDateSearched }) {
  const imageUrl = room.image || PLACEHOLDER_ROOM_IMAGES[index % PLACEHOLDER_ROOM_IMAGES.length];
  
  // If we searched for dates, any room in the list is available for those dates.
  // Otherwise, respect standard status (Available/Under maintenance)
  const isAvailable = room.status !== 'Under maintenance' && room.status !== 'Occupied';
  const displayStatus = isDateSearched ? 'Available' : (room.status || 'Available');

  return (
    <div className="group relative bg-white border border-black/5 hover:border-chalet-gold-hover transition-all duration-500 flex flex-col h-full">
      {/* Image */}
      <div className="relative h-[300px] overflow-hidden">
        <img
          src={imageUrl}
          alt={`Room ${room.roomNumber}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <span className={`absolute top-4 left-4 text-[10px] font-sans font-semibold uppercase tracking-widest px-4 py-1.5 ${
          displayStatus === 'Available' ? 'bg-white text-chalet-dark' : 'bg-chalet-dark text-white'
        }`}>
          {displayStatus}
        </span>
      </div>

      {/* Content */}
      <div className="p-8 flex flex-col flex-grow bg-chalet-bg">
        <div className="flex items-start justify-between mb-4 gap-4">
          <div>
            <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-chalet-gold mb-2">
              {room.RoomType?.name || 'Standard Room'}
            </p>
            <h3 className="text-2xl font-serif text-chalet-dark">Room {room.roomNumber}</h3>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xl font-serif text-chalet-dark">
              {parseFloat(room.pricePerNight || room.price || room.RoomType?.basePrice || 0).toFixed(0)} ETB
            </p>
            <p className="text-[10px] font-sans text-chalet-gray uppercase tracking-widest mt-1">/ night</p>
          </div>
        </div>

        <p className="text-sm font-light text-chalet-dark-light mb-8 leading-relaxed flex-grow">
          {room.description || 'Experience unparalleled comfort in this beautifully designed room, meticulously crafted for your ultimate relaxation.'}
        </p>

        <div className="flex gap-2 flex-wrap mb-8">
          {(room.amenities
            ? (typeof room.amenities === 'string' ? JSON.parse(room.amenities) : room.amenities)
            : ['WiFi', 'AC', 'TV', 'Mini Bar']
          ).slice(0, 4).map((a) => (
            <span key={a} className="text-[10px] uppercase tracking-wider border border-chalet-gold/30 text-chalet-gray px-3 py-1 font-sans">
              {a}
            </span>
          ))}
        </div>

        <button
          onClick={() => isAvailable && onReserve(room)}
          disabled={!isAvailable}
          className={`w-full py-4 text-[11px] font-sans font-semibold uppercase tracking-[0.2em] transition-all duration-300 border ${
            isAvailable
              ? 'bg-transparent border-chalet-dark text-chalet-dark hover:bg-chalet-dark hover:text-white cursor-pointer'
              : 'bg-chalet-light-gray border-transparent text-chalet-gray cursor-not-allowed'
          }`}
        >
          {isAvailable ? 'Reserve Now' : 'Not Available'}
        </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white border border-black/5 flex flex-col h-full animate-pulse">
      <div className="h-[300px] bg-chalet-light-gray" />
      <div className="p-8 flex flex-col flex-grow bg-chalet-bg gap-4">
        <div className="h-3 w-1/4 bg-chalet-light-gray" />
        <div className="h-6 w-1/2 bg-chalet-light-gray" />
        <div className="h-16 w-full bg-chalet-light-gray mt-4" />
        <div className="h-12 w-full bg-chalet-light-gray mt-auto" />
      </div>
    </div>
  );
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Date State
  const getToday = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().split('T')[0]; };
  const getTomorrow = () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().split('T')[0]; };
  
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
  
  // View State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRoom, setSelectedRoom] = useState(null);

  const fetchRooms = (start, end) => {
    setLoading(true);
    let url = '/rooms';
    if (start && end) url += `?startDate=${start}&endDate=${end}`;
    
    apiFetch(url)
      .then(data => setRooms(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Initial fetch (all rooms)
    fetchRooms();
  }, []);

  const handleDateSearch = () => {
    if (dates.checkIn && dates.checkOut) fetchRooms(dates.checkIn, dates.checkOut);
    else fetchRooms(); // Reset if clearing dates
  };

  const setFormatDates = (daysOffsetStart, daysLength) => {
    const today = new Date();
    const start = new Date(today); start.setDate(start.getDate() + daysOffsetStart);
    const end = new Date(start); end.setDate(end.getDate() + daysLength);
    
    // YYYY-MM-DD
    const pad = n => String(n).padStart(2, '0');
    const startStr = `${start.getFullYear()}-${pad(start.getMonth()+1)}-${pad(start.getDate())}`;
    const endStr = `${end.getFullYear()}-${pad(end.getMonth()+1)}-${pad(end.getDate())}`;
    
    setDates({ checkIn: startStr, checkOut: endStr });
    fetchRooms(startStr, endStr);
  };

  const uniqueCategories = useMemo(() => {
    const cats = new Set(rooms.map(r => r.RoomType?.name).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [rooms]);

  const filteredRooms = selectedCategory === 'All' 
    ? rooms 
    : rooms.filter(r => r.RoomType?.name === selectedCategory);

  return (
    <div className="min-h-screen bg-chalet-bg font-sans">
      {/* Hero */}
      <div className="relative h-[60vh] flex items-center justify-center text-center">
        <div className="absolute inset-0" style={{ backgroundImage: `url('${PLACEHOLDER_ROOM_IMAGES[0]}')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-white px-6 mt-8">
          <p className="text-chalet-bg text-xs md:text-sm font-sans tracking-[0.3em] uppercase mb-6 font-semibold drop-shadow-md">
            Our Accommodations
          </p>
          <h1 className="text-5xl md:text-7xl font-serif font-normal drop-shadow-xl mb-6">Experience Comfort</h1>
          <p className="text-white/80 max-w-lg mx-auto text-base font-light italic">
            From cozy rooms to luxurious suites — choose your perfect stay in the heart of serenity.
          </p>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="bg-white border-b border-black/5 sticky top-[72px] z-40 shadow-sm">
        <div className="max-w-6xl mx-auto">
          
          {/* Quick Dates & Custom Date Picker */}
          <div className="p-4 md:p-6 border-b border-black/5 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-chalet-gray mr-2 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Quick Availability
              </span>
              <button onClick={() => setFormatDates(0, 1)} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-black/10 hover:border-chalet-gold hover:text-chalet-gold transition-colors bg-chalet-bg">
                Tonight
              </button>
              <button onClick={() => setFormatDates(1, 1)} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-black/10 hover:border-chalet-gold hover:text-chalet-gold transition-colors bg-chalet-bg">
                Tomorrow
              </button>
              <button onClick={() => {
                const d = new Date(); const day = d.getDay();
                const daysToFriday = day <= 5 ? 5 - day : 6;
                setFormatDates(daysToFriday, 2);
              }} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-black/10 hover:border-chalet-gold hover:text-chalet-gold transition-colors bg-chalet-bg hidden sm:block">
                This Weekend
              </button>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <input type="date" min={getToday()} value={dates.checkIn} onChange={e => setDates(d => ({...d, checkIn: e.target.value}))} 
                className="p-2 border border-black/10 text-xs focus:outline-none focus:border-chalet-gold w-full md:w-32" />
              <span className="text-chalet-gray">—</span>
              <input type="date" min={dates.checkIn || getTomorrow()} value={dates.checkOut} onChange={e => setDates(d => ({...d, checkOut: e.target.value}))} 
                className="p-2 border border-black/10 text-xs focus:outline-none focus:border-chalet-gold w-full md:w-32" />
              <button onClick={handleDateSearch} className="bg-chalet-dark text-white p-2 hover:bg-chalet-gold transition-colors flex items-center justify-center shrink-0">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex overflow-x-auto hide-scrollbar px-2 sm:px-6">
            {uniqueCategories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-6 py-5 text-[11px] font-sans font-semibold uppercase tracking-[0.2em] transition-all duration-300 border-b-2
                  ${selectedCategory === cat 
                    ? 'border-chalet-gold text-chalet-dark' 
                    : 'border-transparent text-chalet-gray hover:text-chalet-dark'}`
                }>
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-[11px] font-sans uppercase tracking-widest text-chalet-gray shrink-0 self-start sm:self-center">
            {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-6 py-24 bg-chalet-bg">
        {error && (
          <div className="text-center py-24 bg-white p-12 max-w-lg mx-auto border border-black/5">
            <p className="text-xl font-serif text-chalet-dark mb-4">Error loading rooms</p>
            <p className="text-chalet-gray font-light text-sm">{error}</p>
          </div>
        )}
        
        {!error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : filteredRooms.length > 0
              ? filteredRooms.map((room, i) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    index={i}
                    onReserve={setSelectedRoom}
                    isDateSearched={!!(dates.checkIn && dates.checkOut)}
                  />
                ))
              : (
                <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center py-32 bg-white border border-black/5">
                  <p className="text-2xl font-serif text-chalet-dark mb-2">No rooms found</p>
                  <p className="text-chalet-gray font-light">Try a different filter status to see more results.</p>
                </div>
              )}
          </div>
        )}
      </main>

      {/* Footer (Simplified for Rooms page) */}
      <footer className="bg-chalet-dark text-center py-8">
        <p className="text-white/40 text-[10px] font-sans tracking-widest uppercase">© {new Date().getFullYear()} Grand Hotel. All rights reserved.</p>
      </footer>

      {/* Reservation Modal */}
      {selectedRoom && (
        <ReservationModal
          room={selectedRoom}
          initialDates={dates}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </div>
  );
}
