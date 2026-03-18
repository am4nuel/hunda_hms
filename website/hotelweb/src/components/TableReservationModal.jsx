import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiPost, apiFetch } from '../lib/api';
import { getUserId } from '../lib/storage';

export default function TableReservationModal({ onClose }) {
  const [formData, setFormData] = useState({
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    reservationTime: '',
    numberOfGuests: 2,
    notes: '',
    diningTableId: ''
  });
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState([]);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const data = await apiFetch('/dining-tables');
        setTables(data.filter(t => t.status === 'Available'));
      } catch (err) {
        console.error('Failed to fetch tables:', err);
      }
    };
    fetchTables();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reservationTime) return toast.error('Please select a reservation time');
    if (!formData.diningTableId) return toast.error('Please select a table');
    
    setLoading(true);
    try {
      const payload = {
        ...formData,
        userId: getUserId(),
        diningTableId: parseInt(formData.diningTableId)
      };
      await apiPost('/table-reservations/public', payload);
      toast.success('Reservation request sent!', {
        description: 'We will confirm your booking shortly.'
      });
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to send reservation request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-xl bg-white p-8 md:p-12 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-chalet-gray hover:text-chalet-dark transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-10">
          <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.3em] text-chalet-gold mb-4">Book Your Table</p>
          <h2 className="text-3xl md:text-4xl font-serif text-chalet-dark">Make a Reservation</h2>
          <div className="w-12 h-px bg-chalet-gold mx-auto mt-6"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-chalet-gray">Full Name</label>
              <input
                required
                type="text"
                placeholder="Ex. John Doe"
                className="w-full bg-chalet-bg border-none px-4 py-4 text-sm focus:ring-1 focus:ring-chalet-gold transition-all outline-none"
                value={formData.guestName}
                onChange={e => setFormData({ ...formData, guestName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-chalet-gray">Phone Number</label>
              <input
                required
                type="tel"
                placeholder="+251..."
                className="w-full bg-chalet-bg border-none px-4 py-4 text-sm focus:ring-1 focus:ring-chalet-gold transition-all outline-none"
                value={formData.guestPhone}
                onChange={e => setFormData({ ...formData, guestPhone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-chalet-gray">Date & Time</label>
              <input
                required
                type="datetime-local"
                min={new Date().toISOString().slice(0, 16)}
                className="w-full bg-chalet-bg border-none px-4 py-4 text-sm focus:ring-1 focus:ring-chalet-gold transition-all outline-none"
                value={formData.reservationTime}
                onChange={e => setFormData({ ...formData, reservationTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-chalet-gray">Table Selection</label>
              <select
                required
                className="w-full bg-chalet-bg border-none px-4 py-4 text-sm focus:ring-1 focus:ring-chalet-gold transition-all outline-none appearance-none"
                value={formData.diningTableId}
                onChange={e => setFormData({ ...formData, diningTableId: e.target.value })}
              >
                <option value="">Select a Table</option>
                {tables.map(table => (
                  <option key={table.id} value={table.id}>
                    Table {table.number} ({table.capacity} Seats)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-chalet-gray">Guests</label>
              <input
                required
                type="number"
                min="1"
                className="w-full bg-chalet-bg border-none px-4 py-4 text-sm focus:ring-1 focus:ring-chalet-gold transition-all outline-none"
                value={formData.numberOfGuests}
                onChange={e => setFormData({ ...formData, numberOfGuests: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-sans font-bold uppercase tracking-widest text-chalet-gray">Special Requests (Optional)</label>
            <textarea
              className="w-full bg-chalet-bg border-none px-4 py-4 text-sm focus:ring-1 focus:ring-chalet-gold transition-all outline-none h-24 resize-none"
              placeholder="Allergies, birthday, window seat..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-chalet-dark text-white py-5 font-sans text-xs font-semibold tracking-widest uppercase hover:bg-chalet-dark-light transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Request Reservation'}
          </button>
        </form>
      </div>
    </div>
  );
}
