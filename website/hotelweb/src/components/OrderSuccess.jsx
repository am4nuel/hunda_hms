import { CheckCircle2, UtensilsCrossed, ShoppingBag, BedDouble, ArrowLeft } from 'lucide-react';

const TYPE_CONFIG = {
  'Dine-in':      { Icon: UtensilsCrossed, label: 'Dine-in',      detail: 'A waiter will bring your order to the table.',    color: '#C3A370' },
  'Takeaway':     { Icon: ShoppingBag,     label: 'Takeaway',     detail: 'Collect at the counter in approximately 20 min.',  color: '#3b82f6' },
  'Room Service': { Icon: BedDouble,       label: 'Room Service', detail: 'Delivery to your room within 30–40 minutes.',      color: '#8b5cf6' },
};

export default function OrderSuccess({ orderType, onClose }) {
  const cfg = TYPE_CONFIG[orderType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="w-full max-w-sm bg-white shadow-2xl overflow-hidden text-center font-sans"
        style={{ animation: 'zoomIn 0.25s ease' }}>

        {/* Header */}
        <div className="bg-chalet-dark py-10 px-6 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-chalet-gold/20 border-2 border-chalet-gold/40 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-chalet-gold" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-white font-serif text-2xl">Order Placed!</h2>
            <p className="text-white/50 text-[12px] font-light mt-1 tracking-wide">
              Sent to our kitchen team.
            </p>
          </div>
        </div>

        {/* Detail card */}
        <div className="p-7 space-y-5">
          {cfg ? (
            <div className="flex items-start gap-4 p-4 bg-gray-50 border border-black/5 text-left">
              <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: `${cfg.color}15`, border: `1.5px solid ${cfg.color}30` }}>
                <cfg.Icon className="w-4 h-4" style={{ color: cfg.color }} strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5" style={{ color: cfg.color }}>
                  {cfg.label}
                </p>
                <p className="text-[13px] text-gray-600 font-light leading-relaxed">{cfg.detail}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Your order is being processed. Thank you!</p>
          )}

          <button
            onClick={onClose}
            className="w-full py-4 bg-chalet-dark text-white font-semibold uppercase tracking-[0.15em] text-[11px] hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Menu
          </button>
        </div>
      </div>

      <style>{`
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
