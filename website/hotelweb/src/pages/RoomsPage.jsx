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
  
  // If we searched for dates, respect the isReserved flag from backend.
  // Otherwise, respect standard status.
  const isMaintenance = room.status === 'Under maintenance';
  
  // A room is available if it's not reserved for the searched dates AND not under maintenance.
  const isAvailable = !room.isReserved && !isMaintenance;
  
  let displayStatus = isMaintenance ? 'Not Available' : 'Available';
  
  if (isDateSearched) {
    displayStatus = room.isReserved ? 'Reserved' : (isMaintenance ? 'Not Available' : 'Available');
  }

  return (
    <div className={`group relative bg-white border ${room.isReserved ? 'border-red-100 opacity-90' : 'border-black/5'} hover:border-chalet-gold-hover transition-all duration-500 flex flex-col h-full`}>
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
      <div className={`p-8 flex flex-col flex-grow ${room.isReserved ? 'bg-red-50/30' : 'bg-chalet-bg'}`}>
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
          {room.isReserved ? 'Reserved' : (isAvailable ? 'Reserve Now' : 'Not Available')}
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
  const [quickAccess, setQuickAccess] = useState('');

  const fetchRooms = (start, end) => {
    setLoading(true);
    let url = '/rooms';
    // Only filter if BOTH dates are explicitly provided
    if (start && end) url += `?startDate=${start}&endDate=${end}`;
    
    apiFetch(url)
      .then(data => setRooms(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Initial fetch: show all rooms without date filtering
    fetchRooms();
  }, []);

  const handleDateSearch = () => {
    setQuickAccess(''); // Reset quick access when manual search is used
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
      <div className="bg-white border-b border-black/5 sticky top-[72px] z-40 shadow-sm overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-nowrap items-end gap-4 min-w-max">
            
            {/* Quick Availability Dropdown */}
            <div className="flex flex-col">
              <label className="text-[9px] uppercase tracking-widest text-chalet-gray font-bold mb-1 ml-1 flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" /> Quick Access
              </label>
              <select 
                value={quickAccess}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuickAccess(val);
                  if (val === 'tonight') setFormatDates(0, 1);
                  else if (val === 'tomorrow') setFormatDates(1, 1);
                  else if (val === 'weekend') {
                    const d = new Date(); const day = d.getDay();
                    const daysToFriday = day <= 5 ? 5 - day : 6;
                    setFormatDates(daysToFriday, 2);
                  }
                }}
                className="p-2 border border-black/10 text-xs font-sans uppercase tracking-widest font-semibold focus:outline-none focus:border-chalet-gold bg-chalet-bg h-9 w-40 cursor-pointer"
              >
                <option value="">Select Option...</option>
                <option value="tonight">Tonight</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="weekend">This Weekend</option>
              </select>
            </div>

            <div className="w-px h-8 bg-black/5 self-center mx-2 hidden md:block" />

            {/* Date Range Selection */}
            <div className="flex items-end gap-2">
              <div className="flex flex-col">
                <label className="text-[9px] uppercase tracking-widest text-chalet-gray font-bold mb-1 ml-1">Check-in</label>
                <input type="date" min={getToday()} value={dates.checkIn} onChange={e => setDates(d => ({...d, checkIn: e.target.value}))} 
                  className="p-2 border border-black/10 text-xs focus:outline-none focus:border-chalet-gold w-36 h-9" />
              </div>
              <span className="text-chalet-gray pb-2">—</span>
              <div className="flex flex-col">
                <label className="text-[9px] uppercase tracking-widest text-chalet-gray font-bold mb-1 ml-1">Check-out</label>
                <input type="date" min={dates.checkIn || getTomorrow()} value={dates.checkOut} onChange={e => setDates(d => ({...d, checkOut: e.target.value}))} 
                  className="p-2 border border-black/10 text-xs focus:outline-none focus:border-chalet-gold w-36 h-9" />
              </div>
            </div>

            <div className="w-px h-8 bg-black/5 self-center mx-2 hidden md:block" />

            {/* Category Dropdown */}
            <div className="flex flex-col">
              <label className="text-[9px] uppercase tracking-widest text-chalet-gray font-bold mb-1 ml-1">Category</label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="p-2 border border-black/10 text-xs font-sans uppercase tracking-widest font-semibold focus:outline-none focus:border-chalet-gold bg-chalet-bg h-9 w-44 cursor-pointer"
              >
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button onClick={handleDateSearch} className="bg-chalet-dark text-white px-6 h-9 hover:bg-chalet-gold transition-colors flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                <Search className="w-3.5 h-3.5" /> Find Rooms
              </button>
              <span className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-chalet-gray/60 whitespace-nowrap ml-4">
                {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''}
              </span>
            </div>

          </div>
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
