import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { apiPost } from '../lib/api';
import apiConfig from '../config/apiConfig';
import { getUserId, getGuestData, saveGuestData } from '../lib/storage';
import {
  UtensilsCrossed, ShoppingBag, BedDouble,
  Upload, X, CheckCircle2, ChevronRight, CreditCard,
  Receipt, Info
} from 'lucide-react';

// ── Service type definitions ─────────────────────────────────────────────────
const SERVICE_TYPES = [
  {
    id: 'Dine-in',
    title: 'Dine In',
    desc: 'Order at the table. Pay after your meal.',
    Icon: UtensilsCrossed,
    color: '#C3A370',
  },
  {
    id: 'Takeaway',
    title: 'Takeaway',
    desc: 'Pick up from the counter. Pay now or on collection.',
    Icon: ShoppingBag,
    color: '#3b82f6',
  },
  {
    id: 'Room Service',
    title: 'Room Service',
    desc: 'Delivered to your room. Automatically charged to your bill.',
    Icon: BedDouble,
    color: '#8b5cf6',
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => `ETB ${parseFloat(n).toFixed(0)}`;

function FieldLabel({ children, optional }) {
  return (
    <label className="block text-[10px] font-sans font-semibold uppercase tracking-widest text-chalet-gray mb-2">
      {children}{optional && <span className="ml-1 normal-case text-chalet-gray/50 tracking-normal">(optional)</span>}
    </label>
  );
}

function InputField({ label, optional, ...props }) {
  return (
    <div>
      <FieldLabel optional={optional}>{label}</FieldLabel>
      <input
        className="w-full text-base font-sans border-b border-black/10 py-3 bg-transparent placeholder:text-chalet-gray/40 focus:outline-none focus:border-chalet-gold transition-colors text-chalet-dark"
        {...props}
      />
    </div>
  );
}

// ── Receipt Upload ────────────────────────────────────────────────────────────
function ReceiptUpload({ receiptFile, receiptUrl, onFileChange, onClear, uploading }) {
  const fileRef = useRef(null);

  return (
    <div>
      <FieldLabel optional>Payment Receipt</FieldLabel>
      <p className="text-[11px] text-chalet-gray font-light mb-3 leading-relaxed">
        Upload a photo of your payment receipt. You can also pay on delivery/collection — this is optional.
      </p>

      {receiptUrl ? (
        <div className="relative rounded overflow-hidden border border-black/5">
          <img src={receiptUrl} alt="Receipt" className="w-full h-40 object-cover" />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] font-semibold uppercase tracking-widest text-center py-2 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-green-400" /> Receipt uploaded
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full h-28 border-2 border-dashed border-black/10 hover:border-chalet-gold/60 transition-colors flex flex-col items-center justify-center gap-2 text-chalet-gray hover:text-chalet-gold bg-white/60"
        >
          {uploading
            ? <><div className="w-5 h-5 border-2 border-chalet-gold/40 border-t-chalet-gold rounded-full animate-spin" /><span className="text-[10px] uppercase tracking-widest">Uploading…</span></>
            : <><Upload className="w-5 h-5" /><span className="text-[10px] font-semibold uppercase tracking-widest">Choose photo / file</span><span className="text-[9px] text-chalet-gray/50">JPG, PNG, PDF — max 5MB</span></>
          }
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={onFileChange} />
    </div>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────
function StepDots({ current, total }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`h-1 rounded-full transition-all ${i + 1 === current ? 'w-6 bg-white' : 'w-2 bg-white/30'}`} />
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function OrderCheckout({ items, total, onClose, onSuccess }) {
  const guest = getGuestData();

  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState('');

  // Step 2 fields
  const [tableNumber, setTableNumber] = useState('');
  const [bookingRef, setBookingRef] = useState('');
  const [firstName, setFirstName] = useState(guest.firstName);
  const [lastName, setLastName] = useState(guest.lastName);
  const [email, setEmail] = useState(guest.email);
  const [phone, setPhone] = useState(guest.phone);

  const [bookings, setBookings] = useState([]);
  const [checkingBookings, setCheckingBookings] = useState(true);

  // Step 2 receipt (Takeaway / Room Service)
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalSteps = 3;

  // ── Auto-save guest data ────────────────────────────────────────────────────
  useEffect(() => {
    saveGuestData({ firstName, lastName, email, phone });
  }, [firstName, lastName, email, phone]);

  // ── Pre-populate room number from active checked-in booking ─────────────────
  useEffect(() => {
    const userId = getUserId();
    (async () => {
      try {
        setCheckingBookings(true);
        const res = await fetch(`${apiConfig.apiUrl}/bookings?userId=${userId}`, {
          headers: { 'X-API-KEY': apiConfig.apiKey },
        });
        if (!res.ok) return;
        const data = await res.json();
        setBookings(data);

        // Find the most recent Checked In booking
        const active = data.find(b => b.status === 'Checked In');
        if (active?.Rooms?.length) {
          const roomNum = active.Rooms[0].roomNumber;
          setBookingRef(String(roomNum));
        }
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
      } finally {
        setCheckingBookings(false);
      }
    })();
  }, []);

  // ── Validation ─────────────────────────────────────────────────────────────
  const canGoToStep3 = () => {
    if (serviceType === 'Dine-in') return tableNumber.trim().length > 0;
    if (serviceType === 'Room Service') {
      if (!bookingRef.trim()) return false;
      // Must have an active checked-in booking for this room
      const hasActiveCheckIn = bookings.some(b => 
        b.status === 'Checked In' && 
        b.Rooms?.some(r => String(r.roomNumber) === bookingRef.trim())
      );
      return hasActiveCheckIn;
    }
    // Takeaway: first name, last name or email/phone required
    return firstName.trim().length > 0 || lastName.trim().length > 0 || email.trim().length > 0 || phone.trim().length > 0;
  };

  // ── Receipt upload ─────────────────────────────────────────────────────────
  const handleReceiptChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB'); return; }

    setReceiptFile(file);
    setUploadingReceipt(true);
    try {
      const form = new FormData();
      form.append('images', file);
      const res = await fetch(`${apiConfig.apiUrl}/upload`, {
        method: 'POST',
        headers: { 'X-API-KEY': apiConfig.apiKey },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setReceiptUrl(`${apiConfig.baseUrl}${data.urls[0]}`);
      toast.success('Receipt uploaded');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
      setReceiptFile(null);
    } finally {
      setUploadingReceipt(false);
    }
  };

  const clearReceipt = () => { setReceiptFile(null); setReceiptUrl(''); };

  // ── Order submission ───────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError('');
    const tid = toast.loading('Placing your order…');
    setLoading(true);
    try {
      const userId = getUserId();
      const payload = {
        orderType: serviceType,
        tableNumber: serviceType === 'Dine-in' ? tableNumber : null,
        bookingId: serviceType === 'Room Service' ? bookingRef : null,
        guestName: `${firstName} ${lastName}`.trim() || null,
        phone: phone || null,
        userId: userId || null,
        // Receipt path (strip base URL back to relative /uploads/... for the server)
        paymentReceipt: receiptUrl ? receiptUrl.replace(apiConfig.baseUrl, '') : null,
        items: items.map(i => ({ menuItemId: i.id, quantity: i.qty, notes: i.notes || '' })),
      };
      await apiPost('/orders', payload);
      
      // Final merge on success
      saveGuestData({ firstName, lastName, email, phone });

      toast.success('Order placed!', { id: tid });
      onSuccess(serviceType);
    } catch (err) {
      const msg = err.message || 'Order failed. Please try again.';
      setError(msg);
      toast.error(msg, { id: tid, duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const selectedType = SERVICE_TYPES.find(t => t.id === serviceType);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4 font-sans">
      <div className="w-full sm:max-w-2xl bg-white shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className="bg-chalet-dark p-6 sm:p-8">
          <div className="flex items-center justify-between mb-5">
            <StepDots current={step} total={totalSteps} />
            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-white/50 text-[10px] font-semibold uppercase tracking-[0.2em] mb-1">
            Step {step} of {totalSteps}
          </p>
          <h2 className="text-white font-serif text-2xl sm:text-3xl">
            {step === 1 && 'How would you like it?'}
            {step === 2 && (serviceType === 'Dine-in' ? 'Your Table' : serviceType === 'Room Service' ? 'Room & Payment' : 'Pickup Details')}
            {step === 3 && 'Review & Confirm'}
          </h2>
          {step === 2 && selectedType && (
            <p className="text-white/40 text-[11px] mt-1 font-light">{selectedType.title}</p>
          )}
        </div>

        {/* ── Body ── */}
        <div className="p-6 sm:p-8 overflow-y-auto max-h-[60vh] bg-chalet-bg space-y-6">

          {/* STEP 1 — Service type */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SERVICE_TYPES.map(t => {
                const active = serviceType === t.id;
                return (
                  <button key={t.id} onClick={() => setServiceType(t.id)}
                    className={`flex flex-col items-center justify-center p-6 bg-white border-2 transition-all text-center gap-3 cursor-pointer select-none 
                      ${ active
                        ? 'border-chalet-gold shadow-xl scale-[1.02]'
                        : 'border-transparent shadow-md hover:shadow-xl hover:scale-[1.02] hover:border-chalet-gold/40'
                      }`}
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: `${t.color}15`, border: `1.5px solid ${t.color}30` }}>
                      <t.Icon className="w-5 h-5" style={{ color: t.color }} />
                    </div>
                    <p className="font-serif text-lg text-chalet-dark">{t.title}</p>
                    <p className="text-[11px] font-light text-chalet-gray leading-relaxed">{t.desc}</p>
                    {active && <div className="w-2 h-2 rounded-full bg-chalet-gold" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* STEP 2 — Details */}
          {step === 2 && (
            <div className="space-y-5 max-w-lg mx-auto bg-white p-6 border border-black/5">

              {/* ── Dine-in ── */}
              {serviceType === 'Dine-in' && (
                <>
                  <InputField label="Table Number" placeholder="e.g. 5"
                    value={tableNumber} onChange={e => setTableNumber(e.target.value)} />
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="First Name" optional placeholder="John"
                      value={firstName} onChange={e => setFirstName(e.target.value)} />
                    <InputField label="Last Name" optional placeholder="Doe"
                      value={lastName} onChange={e => setLastName(e.target.value)} />
                  </div>
                  <InputField label="Email" optional type="email" placeholder="john@example.com"
                    value={email} onChange={e => setEmail(e.target.value)} />
                  <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded">
                    <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-700 leading-relaxed">
                      Payment is handled at your table after the meal. No upfront payment required.
                    </p>
                  </div>
                </>
              )}

              {/* ── Room Service ── */}
              {serviceType === 'Room Service' && (
                <>
                  <InputField label="Room Number" placeholder="e.g. 204"
                    value={bookingRef} onChange={e => setBookingRef(e.target.value)} />
                  
                  {serviceType === 'Room Service' && bookingRef && !checkingBookings && !bookings.some(b => 
                    b.status === 'Checked In' && 
                    b.Rooms?.some(r => String(r.roomNumber) === bookingRef.trim())
                  ) && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded mb-4">
                      <p className="text-[11px] text-red-600 font-medium">
                        No active check-in found for Room {bookingRef}. Please check in at the reception first.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="First Name" optional placeholder="John"
                      value={firstName} onChange={e => setFirstName(e.target.value)} />
                    <InputField label="Last Name" optional placeholder="Doe"
                      value={lastName} onChange={e => setLastName(e.target.value)} />
                  </div>
                  <InputField label="Email" optional type="email" placeholder="john@example.com"
                    value={email} onChange={e => setEmail(e.target.value)} />
                  <InputField label="Phone Number" optional type="tel" placeholder="+251..."
                    value={phone} onChange={e => setPhone(e.target.value)} />
                  
                  {/* Per user request: Room Service is always Charge to Room. No receipt needed. */}
                  <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-100 rounded">
                    <Info className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-purple-700 leading-relaxed font-medium">
                      This order will be automatically added to your room bill. You can settle it during checkout.
                    </p>
                  </div>
                </>
              )}

              {/* ── Takeaway ── */}
              {serviceType === 'Takeaway' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="First Name" placeholder="John"
                      value={firstName} onChange={e => setFirstName(e.target.value)} />
                    <InputField label="Last Name" placeholder="Doe"
                      value={lastName} onChange={e => setLastName(e.target.value)} />
                  </div>
                  <InputField label="Email" optional type="email" placeholder="john@example.com"
                    value={email} onChange={e => setEmail(e.target.value)} />
                  <InputField label="Phone Number" optional type="tel" placeholder="+251..."
                    value={phone} onChange={e => setPhone(e.target.value)} />
                  <ReceiptUpload
                    receiptFile={receiptFile} receiptUrl={receiptUrl}
                    onFileChange={handleReceiptChange} onClear={clearReceipt}
                    uploading={uploadingReceipt}
                  />
                </>
              )}
            </div>
          )}

          {/* STEP 3 — Review */}
          {step === 3 && (
            <div className="max-w-xl mx-auto space-y-4">

              {/* Order-type banner */}
              <div className="bg-white border border-black/5 p-5 flex items-center gap-4">
                {selectedType && (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `${selectedType.color}15`, border: `1.5px solid ${selectedType.color}30` }}>
                    <selectedType.Icon className="w-5 h-5" style={{ color: selectedType.color }} />
                  </div>
                )}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-chalet-gold mb-0.5">{selectedType?.title}</p>
                  {serviceType === 'Dine-in' && tableNumber && <p className="font-serif text-lg text-chalet-dark">Table {tableNumber}</p>}
                  {serviceType === 'Room Service' && bookingRef && <p className="font-serif text-lg text-chalet-dark">Room {bookingRef}</p>}
                  {(firstName || lastName) && <p className="text-chalet-dark font-medium text-sm">{firstName} {lastName}</p>}
                  {email && <p className="text-chalet-gray font-light text-[11px]">{email}</p>}
                  {phone && <p className="text-chalet-gray/70 text-[11px]">{phone}</p>}
                </div>
              </div>

              {/* Receipt preview if uploaded */}
              {receiptUrl && (
                <div className="bg-white border border-black/5 p-4 flex items-center gap-3">
                  <Receipt className="w-5 h-5 text-chalet-gold flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-chalet-gray">Receipt Uploaded</p>
                    <a href={receiptUrl} target="_blank" rel="noreferrer"
                      className="text-[11px] text-chalet-gold hover:text-chalet-gold-hover transition-colors">View receipt →</a>
                  </div>
                  <img src={receiptUrl} alt="Receipt thumb" className="w-12 h-12 object-cover rounded" />
                </div>
              )}

              {/* Items list */}
              <div className="bg-white border border-black/5 p-6 space-y-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between items-start border-b border-black/5 pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-serif text-base text-chalet-dark">{item.name}</p>
                      {item.notes && <p className="text-[10px] italic text-chalet-gray mt-0.5">"{item.notes}"</p>}
                      <p className="text-[10px] font-sans mt-1 text-chalet-gray">Qty: {item.qty}</p>
                    </div>
                    <p className="font-serif text-base text-chalet-dark">{fmt(parseFloat(item.price) * item.qty)}</p>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-4 border-t border-black/10">
                  <p className="font-sans text-[11px] font-semibold tracking-widest uppercase text-chalet-dark">Total</p>
                  <p className="font-serif text-2xl text-chalet-gold">{fmt(total)}</p>
                </div>
              </div>

              {/* Dine-in: payment reminder */}
              {serviceType === 'Dine-in' && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100">
                  <CreditCard className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    <strong>Payment at table:</strong> Our staff will bring the bill after your meal. No upfront payment needed.
                  </p>
                </div>
              )}

              {/* Room Service: forced charge to room notice */}
              {serviceType === 'Room Service' && (
                <div className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-100">
                  <BedDouble className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-purple-700 leading-relaxed font-medium">
                    <strong>Charged to Room:</strong> This total will be added to your final hotel bill for Room {bookingRef}.
                  </p>
                </div>
              )}

              {/* Takeaway: no receipt notice */}
              {serviceType === 'Takeaway' && !receiptUrl && (
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100">
                  <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    No receipt uploaded — you can pay on collection. Our staff will confirm payment with you.
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 text-sm text-center">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="bg-white flex border-t border-black/5">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)}
              className="flex-1 py-5 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-chalet-gray hover:text-chalet-dark transition-colors border-r border-black/5 bg-chalet-bg/50">
              ← Back
            </button>
          )}
          {step < 3 && (
            <button
              disabled={step === 1 ? !serviceType : !canGoToStep3()}
              onClick={() => setStep(s => s + 1)}
              className="flex-1 py-5 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-white bg-chalet-dark hover:bg-chalet-dark-light transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          )}
          {step === 3 && (
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 py-5 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-white bg-chalet-gold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Processing…</>
                : <><CheckCircle2 className="w-4 h-4" /> Place Order</>
              }
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
