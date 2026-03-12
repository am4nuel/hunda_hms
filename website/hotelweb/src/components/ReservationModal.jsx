import { useState, useEffect, useRef } from 'react';
import { apiPost, apiFetch } from '../lib/api';
import apiConfig from '../config/apiConfig';
import { getUserId, getGuestData, saveGuestData } from '../lib/storage';
import CalendarPicker from './CalendarPicker';
import { toast } from 'sonner';

const STEPS = ['Guest Info', 'ID Upload', 'Stay Details', 'Payment'];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`flex items-center justify-center w-6 h-6 border text-[10px] font-sans font-semibold transition-all ${
            i < current ? 'bg-chalet-gold border-chalet-gold text-white' :
            i === current ? 'bg-chalet-dark border-chalet-dark text-white' :
            'bg-transparent border-black/10 text-chalet-gray'
          }`}>
            {i < current ? '✓' : i + 1}
          </div>
          <span className={`text-[10px] uppercase tracking-widest font-semibold hidden sm:block ${i === current ? 'text-chalet-dark' : 'text-chalet-gray'}`}>
            {label}
          </span>
          {i < STEPS.length - 1 && (
            <div className={`w-8 h-px ${i < current ? 'bg-chalet-gold' : 'bg-black/10'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// Helper for phone normalization (local Ethiopian format)
const normalizePhone = (phone) => {
  if (!phone) return phone;
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+251')) cleaned = '0' + cleaned.slice(4);
  else if (cleaned.startsWith('251')) cleaned = '0' + cleaned.slice(3);
  if (cleaned.length === 9 && (cleaned.startsWith('7') || cleaned.startsWith('9'))) cleaned = '0' + cleaned;
  if (/^0[79]\d{8}$/.test(cleaned)) return cleaned;
  return phone;
};

export default function ReservationModal({ room, initialDates, onClose }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);
  const [banks, setBanks] = useState([]);
  const [occupiedDates, setOccupiedDates] = useState([]);
  const [fetchingOccupied, setFetchingOccupied] = useState(true);
  const modalBodyRef = useRef(null);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [dates, setDates] = useState({
    checkInDate: initialDates?.checkIn || today,
    checkOutDate: initialDates?.checkOut || tomorrow,
    specialRequests: ''
  });

  const userId = getUserId();
  const savedGuest = getGuestData();

  const [guest, setGuest] = useState({
    firstName: savedGuest.firstName || '',
    lastName: savedGuest.lastName || '',
    email: savedGuest.email || '',
    phone: savedGuest.phone || '',
    idType: 'Passport',
    idFront: '',
    idBack: '',
  });

  const [payment, setPayment] = useState({
    bankId: '',
    receipt: '',
  });

  const getSuggestion = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  };

  const effectiveCheckOut = dates.checkOutDate || getSuggestion(dates.checkInDate);

  const nights = Math.max(
    1,
    Math.ceil((new Date(effectiveCheckOut) - new Date(dates.checkInDate)) / 86400000)
  );
  const pricePerNight = parseFloat(
    room.pricePerNight || room.price || room.RoomType?.basePrice || 0
  );
  const totalPrice = (pricePerNight * nights).toFixed(2);

  // ── Auto-scroll to top on error ──
  useEffect(() => {
    if (error && modalBodyRef.current) {
      modalBodyRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const data = await apiFetch('/banks');
        setBanks(data);
      } catch (err) {
        console.error('Failed to fetch banks:', err);
      }
    };

    const fetchOccupiedDates = async () => {
      try {
        setFetchingOccupied(true);
        const data = await apiFetch(`/rooms/${room.id}/occupied-dates`);
        setOccupiedDates(data);
      } catch (err) {
        console.error('Failed to fetch occupied dates:', err);
      } finally {
        setFetchingOccupied(false);
      }
    };

    fetchBanks();
    fetchOccupiedDates();
  }, [room.id]);

  const handleGuestChange = (e) =>
    setGuest((g) => ({ ...g, [e.target.name]: e.target.value }));
  const handleDateChange = (e) =>
    setDates((d) => ({ ...d, [e.target.name]: e.target.value }));
  const handlePaymentChange = (e) =>
    setPayment((p) => ({ ...p, [e.target.name]: e.target.value }));

  const validateStep0 = () => {
    if (!guest.firstName.trim() || !guest.lastName.trim() || !guest.phone.trim()) {
      setError('First name, last name, and phone are required.');
      return false;
    }
    if (guest.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const validateStep1 = () => {
    if (!guest.idFront || !guest.idBack) {
      setError('Please upload both front and back images of your ID.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const start = new Date(dates.checkInDate);
    const end = new Date(effectiveCheckOut);

    if (!dates.checkInDate) {
      setError('Please select a check-in date.');
      return false;
    }

    if (end <= start) {
      setError('Check-out date must be after check-in date.');
      return false;
    }

    // Check for overlaps with already booked dates
    const hasOverlap = occupiedDates.some(range => {
      const busyStart = new Date(range.checkInDate || range.startDate);
      const busyEnd = new Date(range.checkOutDate || range.endDate);
      return start < busyEnd && end > busyStart;
    });

    if (hasOverlap) {
      setError('The selected dates overlap with an existing booking. Please choose different dates.');
      return false;
    }

    return true;
  };

  // ── Auto-save guest data ────────────────────────────────────────────────────
  useEffect(() => {
    saveGuestData(guest);
  }, [guest]);

  const handleNext = () => {
    setError('');
    if (step === 0) {
      if (!validateStep0()) return;
      // Normalize phone
      const normalizedPhone = normalizePhone(guest.phone);
      setGuest(g => ({ ...g, phone: normalizedPhone }));
    }
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      // 1. Create/Update Guest
      const guestData = await apiPost('/guests', {
        ...guest,
        userId // Include anonymous tracking ID
      });

      // 2. Create Booking
      const bookingData = await apiPost('/bookings', {
        guestId: guestData.id,
        roomIds: [room.id],
        checkInDate: dates.checkInDate,
        checkOutDate: effectiveCheckOut,
        specialRequests: dates.specialRequests,
        bankId: payment.bankId || null,
        paymentReceipt: payment.receipt || null,
        userId // Include anonymous tracking ID
      });

      setBooking(bookingData);
      setStep(STEPS.length);
      
      // Save for future reference (final confirmation)
      saveGuestData(guest);
      toast.success('Reservation successful!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Success ──
  if (step === STEPS.length && booking) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans" onClick={onClose}>
        <div
          className="bg-white shadow-2xl max-w-md w-full p-10 text-center border border-black/5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-16 h-px bg-chalet-gold mx-auto mb-8"></div>
          <h2 className="text-3xl font-serif text-chalet-dark mb-4">Reservation Confirmed</h2>
          <p className="text-chalet-gray text-sm font-light mb-8">
            Your reservation for <strong className="font-semibold">Room {room.roomNumber}</strong> is confirmed.
          </p>
          <div className="bg-chalet-bg p-6 text-left space-y-4 mb-8 border border-black/5">
            {[
              ['Booking ID', `#${booking.id}`],
              ['Guest', `${guest.firstName} ${guest.lastName}`],
              ['Check-in', new Date(dates.checkInDate).toLocaleDateString()],
              ['Check-out', new Date(effectiveCheckOut).toLocaleDateString()],
            ].map(([l, v]) => (
              <div key={l} className="flex justify-between text-[11px] font-sans">
                <span className="text-chalet-gray font-semibold uppercase tracking-widest">{l}</span>
                <span className="font-bold text-chalet-dark">{v}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-black/10 pt-4 mt-4">
              <span className="text-chalet-dark font-sans text-[11px] font-semibold uppercase tracking-widest">Total</span>
              <span className="font-serif text-lg text-chalet-gold">
                ${booking.totalAmount || totalPrice}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-chalet-gray font-light mb-8">
            A confirmation will be sent to <strong className="font-semibold">{guest.email}</strong>
          </p>
          <button
            onClick={onClose}
            className="w-full py-4 bg-chalet-dark text-white font-sans text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-chalet-dark-light transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // ── Form ──
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 shadow-2xl backdrop-blur-sm font-sans"
      onClick={onClose}
    >
      <div
        ref={modalBodyRef}
        className="bg-white shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white px-8 pt-8 pb-4 border-b border-black/5 z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] text-chalet-gold mb-1">Reserve</p>
              <h2 className="text-3xl font-serif text-chalet-dark">Room {room.roomNumber}</h2>
              <p className="text-xs text-chalet-gray mt-1 font-light italic">{room.RoomType?.name || 'Standard Room'}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-chalet-gray hover:text-chalet-dark transition-colors text-xl font-light"
            >
              ✕
            </button>
          </div>
          <StepIndicator current={step} />
        </div>

        {/* Body */}
        <div className="px-8 py-8 bg-chalet-bg min-h-[400px]">
          {error && (
            <div className="mb-6 p-4 bg-white border border-red-200 text-red-600 text-sm font-semibold text-center">
              {error}
            </div>
          )}

          {/* ── Step 0: Guest Details ── */}
          {step === 0 && (
            <div className="space-y-6 bg-white p-8 border border-black/5">
              <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-chalet-dark mb-4 border-b border-black/10 pb-2">Guest Information</p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { name: 'firstName', label: 'First Name *', placeholder: 'John', type: 'text' },
                  { name: 'lastName', label: 'Last Name *', placeholder: 'Doe', type: 'text' },
                ].map(({ name, label, placeholder, type }) => (
                  <div key={name}>
                    <label className="block text-[10px] font-sans font-semibold uppercase tracking-widest text-chalet-gray mb-1.5">{label}</label>
                    <input
                      name={name}
                      type={type}
                      value={guest[name]}
                      onChange={handleGuestChange}
                      placeholder={placeholder}
                      className="w-full text-sm font-sans border-b border-black/10 py-2 bg-transparent placeholder:text-chalet-gray/50 focus:outline-none focus:border-chalet-gold transition-colors"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-[10px] font-sans font-semibold uppercase tracking-widest text-chalet-gray mb-1.5">Email (Optional)</label>
                <input
                  name="email"
                  type="email"
                  value={guest.email}
                  onChange={handleGuestChange}
                  placeholder="john@example.com"
                  className="w-full text-sm font-sans border-b border-black/10 py-2 bg-transparent placeholder:text-chalet-gray/50 focus:outline-none focus:border-chalet-gold transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-sans font-semibold uppercase tracking-widest text-chalet-gray mb-1.5">Phone *</label>
                <input
                  name="phone"
                  type="tel"
                  value={guest.phone}
                  onChange={handleGuestChange}
                  placeholder="09..."
                  className="w-full text-sm font-sans border-b border-black/10 py-2 bg-transparent placeholder:text-chalet-gray/50 focus:outline-none focus:border-chalet-gold transition-colors"
                />
              </div>
            </div>
          )}

          {/* ── Step 1: ID Upload ── */}
          {step === 1 && (
            <div className="space-y-6 bg-white p-8 border border-black/5">
              <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-chalet-dark mb-4 border-b border-black/10 pb-2">ID Verification</p>
              
              <div>
                <label className="block text-[10px] font-sans font-semibold uppercase tracking-widest text-chalet-gray mb-1.5">ID Type</label>
                <select
                  name="idType"
                  value={guest.idType}
                  onChange={handleGuestChange}
                  className="w-full text-sm font-sans border-b border-black/10 py-2 bg-transparent focus:outline-none focus:border-chalet-gold transition-colors"
                >
                  <option>Passport</option>
                  <option>National ID</option>
                  <option>Driver's License</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { label: 'Upload ID Front *', field: 'idFront' },
                  { label: 'Upload ID Back *', field: 'idBack' }
                ].map(({ label, field }) => (
                  <div key={field} className="space-y-3">
                    <label className="block text-[10px] font-sans font-semibold uppercase tracking-widest text-chalet-gray">{label}</label>
                    <div className="relative border-2 border-dashed border-black/10 hover:border-chalet-gold transition-colors aspect-[3/2] flex flex-col items-center justify-center bg-chalet-bg/30">
                      {guest[field] ? (
                        <div className="relative w-full h-full p-2">
                          <img 
                            src={`${apiConfig.baseUrl}${guest[field]}`} 
                            alt={label} 
                            className="w-full h-full object-cover"
                          />
                          <button 
                            onClick={() => setGuest(g => ({ ...g, [field]: '' }))}
                            className="absolute top-2 right-2 bg-black/50 text-white w-6 h-6 flex items-center justify-center text-xs hover:bg-black"
                          >✕</button>
                        </div>
                      ) : (
                        <>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              const formData = new FormData();
                              formData.append('images', file);
                              try {
                                const res = await fetch(`${apiConfig.apiUrl}/upload`, {
                                  method: 'POST',
                                  headers: { 'X-API-KEY': apiConfig.apiKey },
                                  body: formData
                                });
                                const data = await res.json();
                                if (data.urls?.[0]) {
                                  setGuest(g => ({ ...g, [field]: data.urls[0] }));
                                }
                              } catch (err) {
                                setError('Failed to upload image. Please try again.');
                              }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          />
                          <span className="text-2xl text-chalet-gray/30 mb-2">+</span>
                          <span className="text-[10px] uppercase tracking-widest text-chalet-gray">Select Image</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Stay Details ── */}
          {step === 2 && (
            <div className="space-y-8">
              <div className="bg-white p-8 border border-black/5">
                <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-chalet-dark mb-6 border-b border-black/10 pb-2">Select Your Dates</p>
                <CalendarPicker
                  startDate={dates.checkInDate}
                  endDate={dates.checkOutDate}
                  disabledDates={occupiedDates}
                  onChange={({ checkInDate, checkOutDate }) => {
                    setDates(prev => ({
                      ...prev,
                      checkInDate,
                      checkOutDate
                    }));
                  }}
                />
              </div>

              {/* Premium Stay Summary */}
              <div className="bg-chalet-dark text-white p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-chalet-gold/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <p className="text-[10px] font-sans font-bold uppercase tracking-[0.3em] text-chalet-gold mb-6">Stay Summary</p>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-end border-b border-white/10 pb-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-white/50 mb-1">Accommodation</p>
                      <h4 className="text-xl font-serif">Room {room.roomNumber}</h4>
                      <p className="text-[10px] text-chalet-gold uppercase tracking-widest">{room.RoomType?.name || 'Standard'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-serif">{pricePerNight.toFixed(0)} ETB</p>
                      <p className="text-[9px] uppercase tracking-widest text-white/40">per night</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 pt-2">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-white/50 mb-1">Check-in</p>
                      <p className="text-sm font-sans font-medium">{new Date(dates.checkInDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-white/50 mb-1">Check-out</p>
                      <p className="text-sm font-sans font-medium">
                        {new Date(effectiveCheckOut).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                        {!dates.checkOutDate && <span className="text-[9px] text-chalet-gold ml-2 italic tracking-normal">(Suggested)</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-6 mt-4 border-t border-chalet-gold/30">
                    <div>
                      <p className="text-[20px] font-serif text-chalet-gold">{totalPrice} ETB</p>
                      <p className="text-[9px] uppercase tracking-widest text-white/40">Total for {nights} night{nights !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="px-4 py-2 bg-chalet-gold/20 border border-chalet-gold/30 text-chalet-gold text-[10px] font-bold uppercase tracking-widest">
                      Reservation Only
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 border border-black/5">
                <label className="block text-[10px] font-sans font-semibold uppercase tracking-widest text-chalet-gray mb-3 text-center">Special Requests</label>
                <textarea
                  name="specialRequests"
                  value={dates.specialRequests}
                  onChange={handleDateChange}
                  rows={2}
                  placeholder="Tell us any special requests or preferences to make your stay perfect..."
                  className="w-full text-sm font-sans border-b border-black/10 py-2 bg-transparent placeholder:text-chalet-gray/50 focus:outline-none focus:border-chalet-gold transition-colors resize-none text-center italic"
                />
              </div>
            </div>
          )}

          {/* ── Step 3: Payment ── */}
          {step === 3 && (
            <div className="space-y-6 bg-white p-8 border border-black/5">
              <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.2em] text-chalet-dark mb-4 border-b border-black/10 pb-2">Payment Confirmation</p>
              
              <div className="bg-chalet-bg p-6 border border-black/5 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-chalet-gray">Total Amount</span>
                  <span className="text-2xl font-serif text-chalet-gold">{totalPrice} ETB</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-sans font-semibold uppercase tracking-widest text-chalet-gray mb-1.5">Choose a Bank</label>
                <select
                  name="bankId"
                  value={payment.bankId}
                  onChange={handlePaymentChange}
                  className="w-full text-sm font-sans border-b border-black/10 py-2 bg-transparent focus:outline-none focus:border-chalet-gold transition-colors font-semibold text-chalet-dark"
                >
                  <option value="">Select a bank...</option>
                  {banks.map(bank => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name} - {bank.accountNumber} ({bank.accountHolder})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-sans font-semibold uppercase tracking-widest text-chalet-gray">Upload Payment Receipt (Optional)</label>
                <div className="relative border-2 border-dashed border-black/10 hover:border-chalet-gold transition-colors p-6 flex flex-col items-center justify-center bg-chalet-bg/30">
                  {payment.receipt ? (
                    <div className="relative w-full text-center">
                      <p className="text-sm font-semibold text-green-600 mb-2 truncate px-4">✓ Receipt Uploaded</p>
                      <button 
                        onClick={() => setPayment(p => ({ ...p, receipt: '' }))}
                        className="text-[10px] uppercase tracking-widest text-chalet-gray hover:text-chalet-dark underline"
                      >Remove and change</button>
                    </div>
                  ) : (
                    <>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          const formData = new FormData();
                          formData.append('images', file);
                          try {
                            const res = await fetch(`${apiConfig.apiUrl}/upload`, {
                              method: 'POST',
                              headers: { 'X-API-KEY': apiConfig.apiKey },
                              body: formData
                            });
                            const data = await res.json();
                            if (data.urls?.[0]) {
                              setPayment(p => ({ ...p, receipt: data.urls[0] }));
                            }
                          } catch (err) {
                            setError('Failed to upload receipt. Please try again.');
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <span className="text-[10px] uppercase tracking-widest text-chalet-gray">Select Receipt Image</span>
                    </>
                  )}
                </div>
                <p className="text-[10px] italic text-chalet-gray text-center">You can complete the reservation now and upload the receipt later in your dashboard if you prefer.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-black/5 flex">
          {step > 0 && (
            <button
              onClick={() => { setError(''); setStep((s) => s - 1); }}
              disabled={loading}
              className="flex-1 py-5 border-r border-black/5 text-chalet-gray text-[11px] font-sans font-semibold uppercase tracking-[0.2em] hover:text-chalet-dark bg-chalet-bg/50 hover:bg-chalet-bg transition-colors disabled:opacity-50"
            >
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex-[2] py-5 bg-chalet-dark text-white text-[11px] font-sans font-semibold uppercase tracking-[0.2em] hover:bg-chalet-dark-light transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-[2] py-5 bg-chalet-gold text-white text-[11px] font-sans font-semibold uppercase tracking-[0.2em] hover:bg-chalet-gold-hover transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : 'Confirm Reservation'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
