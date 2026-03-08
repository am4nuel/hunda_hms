export default function CartSidebar({ items, total, onUpdateQty, onRemove, onUpdateNotes, onCheckout, onClose }) {
  const fmt = (n) => `${parseFloat(n).toFixed(0)} ETB`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-sm bg-chalet-bg h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-500">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-black/5 bg-white">
          <div>
            <h2 className="font-serif text-2xl text-chalet-dark">Your Order</h2>
            <p className="text-[10px] font-sans font-semibold uppercase tracking-widest text-chalet-gray mt-1">
              {items.length} item{items.length !== 1 ? 's' : ''} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 text-chalet-gray hover:text-chalet-dark transition-colors text-xl font-light"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scrollbar-hide">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <p className="font-serif text-2xl text-chalet-dark mb-4">Your cart is empty</p>
              <p className="text-sm font-light text-chalet-gray">Browse the menu and add items to your order.</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="bg-white border border-black/5 p-6 space-y-4 relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-lg text-chalet-dark leading-tight">{item.name}</p>
                    <p className="text-chalet-gold font-serif text-base mt-1">{fmt(item.price)}</p>
                  </div>
                  <button
                    onClick={() => onRemove(item.id)}
                    className="text-chalet-gray hover:text-red-500 transition-colors text-sm underline"
                  >
                    Remove
                  </button>
                </div>

                {/* Quantity control */}
                <div className="flex items-center justify-between pt-2 border-t border-black/5">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => onUpdateQty(item.id, Math.max(1, item.qty - 1))}
                      className="text-chalet-gray hover:text-chalet-dark font-serif text-xl"
                    >
                      −
                    </button>
                    <span className="font-sans text-sm font-semibold text-chalet-dark w-4 text-center">{item.qty}</span>
                    <button
                      onClick={() => onUpdateQty(item.id, item.qty + 1)}
                      className="text-chalet-gray hover:text-chalet-dark font-serif text-xl"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-serif text-lg text-chalet-dark">{fmt(parseFloat(item.price) * item.qty)}</p>
                </div>

                {/* Notes */}
                <input
                  type="text"
                  placeholder="Special instructions…"
                  value={item.notes}
                  onChange={e => onUpdateNotes(item.id, e.target.value)}
                  className="w-full text-xs font-light font-sans border-b border-black/10 py-2 bg-transparent placeholder:text-chalet-gray focus:outline-none focus:border-chalet-gold transition-colors"
                />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-8 py-8 bg-chalet-dark text-white space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="font-sans text-[11px] font-semibold uppercase tracking-widest text-white/50">Total Amount</span>
              <span className="font-serif text-3xl text-chalet-gold">{fmt(total)}</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full py-4 text-[11px] font-sans font-semibold uppercase tracking-[0.2em] bg-chalet-gold text-white hover:bg-chalet-gold-hover transition-colors shadow-xl"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
