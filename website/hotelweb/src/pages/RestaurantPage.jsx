import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiFetch } from '../lib/api';
import { useCart } from '../hooks/useCart';
import CartSidebar from '../components/CartSidebar';
import OrderCheckout from '../components/OrderCheckout';
import OrderSuccess from '../components/OrderSuccess';

const PLACEHOLDER_FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=80',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800&q=80',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
];

import apiConfig from '../config/apiConfig';

const SERVER_URL = apiConfig.baseUrl;

// ── Menu Item Card ─────────────────────────────────────────────────────────────
function MenuItemCard({ item, index, onAdd, justAdded }) {
  const imageUrl = item.image
    ? `${SERVER_URL}${item.image}`
    : PLACEHOLDER_FOOD_IMAGES[index % PLACEHOLDER_FOOD_IMAGES.length];

  return (
    <div className="group relative flex gap-6 p-6 bg-white border border-black/5 hover:border-chalet-gold-hover transition-all duration-300">
      {/* Image */}
      <div className="relative w-32 h-32 shrink-0 overflow-hidden">
        <img
          src={imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        {!item.availability && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white text-[10px] font-sans font-bold uppercase tracking-widest px-2 text-center text-balance">Unavailable</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-serif text-xl text-chalet-dark leading-tight">{item.name}</h3>
            <span className="font-serif text-lg text-chalet-dark shrink-0">
              {parseFloat(item.price || 0).toFixed(0)} ETB
            </span>
          </div>
          {item.MenuCategory && (
            <span className="inline-block mt-2 text-[10px] font-sans font-semibold uppercase tracking-widest text-chalet-gold">
              {item.MenuCategory.name}
            </span>
          )}
          <p className="text-sm font-light text-chalet-gray mt-3 line-clamp-2 leading-relaxed">
            {item.description || 'A carefully crafted dish made with the finest ingredients.'}
          </p>
        </div>

        {/* Add to order button */}
        <div className="mt-4">
          {item.availability !== false ? (
            <button
              onClick={() => onAdd(item)}
              className={`flex items-center gap-2 pb-1 text-[11px] font-sans font-semibold uppercase tracking-[0.2em] transition-all duration-300 border-b border-transparent hover:border-chalet-gold ${
                justAdded
                  ? 'text-chalet-gold border-chalet-gold'
                  : 'text-chalet-dark hover:text-chalet-gold'
              }`}
            >
              {justAdded ? '✓ Added' : '+ Add'}
            </button>
          ) : (
            <span className="text-[10px] text-chalet-gray font-sans uppercase tracking-widest">Out of stock</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Category Section ───────────────────────────────────────────────────────────
function CategorySection({ category, items, onAdd, justAdded }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-20">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-serif text-chalet-dark mb-4">{category}</h2>
        <div className="w-12 h-px bg-chalet-gold mx-auto"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {items.map((item, i) => (
          <MenuItemCard
            key={item.id}
            item={item}
            index={i}
            onAdd={onAdd}
            justAdded={justAdded === item.id}
          />
        ))}
      </div>
    </div>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function SkeletonMenuItem() {
  return (
    <div className="flex gap-6 p-6 bg-white border border-black/5 animate-pulse">
      <div className="w-32 h-32 bg-chalet-light-gray shrink-0" />
      <div className="flex-1 space-y-3 py-1">
        <div className="h-5 bg-chalet-light-gray w-3/4" />
        <div className="h-3 bg-chalet-light-gray w-1/4 mt-4" />
        <div className="h-3 bg-chalet-light-gray w-full mt-4" />
        <div className="h-3 bg-chalet-light-gray w-5/6" />
      </div>
    </div>
  );
}

// ── Floating Cart Button ───────────────────────────────────────────────────────
function FloatingCartButton({ count, total, onClick }) {
  if (count === 0) return null;
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6 bg-chalet-dark text-white px-8 py-4 shadow-2xl hover:bg-chalet-dark-light transition-all duration-300"
    >
      <span className="flex items-center justify-center h-6 w-6 border border-chalet-gold text-[10px] font-sans font-semibold">
        {count}
      </span>
      <span className="font-sans text-[11px] font-semibold tracking-widest uppercase">View Order</span>
      <span className="font-serif text-lg text-chalet-gold">${parseFloat(total).toFixed(0)}</span>
    </button>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function RestaurantPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [justAdded, setJustAdded] = useState(null);

  // Overlay states
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderType, setOrderType] = useState('');

  const { items, addItem, removeItem, updateQty, updateNotes, clearCart, total, count } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsData, catsData] = await Promise.all([
          apiFetch('/menu-items'),
          apiFetch('/menu-categories'),
        ]);
        setMenuItems(Array.isArray(itemsData) ? itemsData : []);
        setCategories(Array.isArray(catsData) ? catsData : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAdd = (item) => {
    addItem(item);
    setJustAdded(item.id);
    toast.success(`${item.name} added to order`, {
      description: 'You can review your order in the cart.',
      duration: 2000,
    });
    setTimeout(() => setJustAdded(null), 1200);
  };

  const handleOrderSuccess = (type) => {
    clearCart();
    setOrderType(type);
    setShowCheckout(false);
    setShowCart(false);
    setShowSuccess(true);
  };

  // Group items by category
  const groupedItems = {};
  menuItems.forEach(item => {
    const cat = item.MenuCategory?.name || 'Other';
    if (!groupedItems[cat]) groupedItems[cat] = [];
    groupedItems[cat].push(item);
  });

  const categoryNames = ['All', ...Object.keys(groupedItems)];
  const displayItems = activeCategory === 'All'
    ? groupedItems
    : { [activeCategory]: groupedItems[activeCategory] || [] };

  return (
    <div className="min-h-screen bg-chalet-bg font-sans">

      {/* Hero */}
      <div
        className="relative h-[60vh] flex items-center justify-center text-center"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-white px-6 mt-8">
          <p className="text-white text-xs md:text-sm font-sans tracking-[0.3em] uppercase mb-6 font-semibold drop-shadow-md">
            Culinary Excellence
          </p>
          <h1 className="text-5xl md:text-7xl font-serif font-normal drop-shadow-xl mb-6 leading-tight">
            Fine Dining
          </h1>
          <p className="text-white/80 max-w-lg mx-auto text-base font-light italic mb-10">
            An exceptional culinary journey — Dine In, Takeaway, or Room Service.
          </p>
          {/* Quick order type pills */}
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {['Dine In', 'Takeaway', 'Room Service'].map(label => (
              <span key={label} className="text-[10px] font-sans font-semibold uppercase tracking-[0.2em] border border-white/40 px-6 py-2">
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Category nav */}
      <div className="bg-white border-b border-black/5 sticky top-[72px] z-30">
        <div className="max-w-6xl mx-auto px-6 py-6 flex gap-8 overflow-x-auto scrollbar-hide justify-center">
          {categoryNames.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[11px] font-sans font-semibold uppercase tracking-[0.2em] whitespace-nowrap transition-all border-b pb-1 ${
                activeCategory === cat
                  ? 'border-chalet-gold text-chalet-dark'
                  : 'border-transparent text-chalet-gray hover:text-chalet-dark'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-24">
        {/* How it works info */}
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <h2 className="text-2xl font-serif text-chalet-dark mb-4">How to order</h2>
          <p className="text-sm font-light text-chalet-gray leading-relaxed">
            Add items to your cart, then choose <strong className="font-semibold text-chalet-dark">Dine In</strong> (enter your table number), <strong className="font-semibold text-chalet-dark">Takeaway</strong> (collect at counter), or <strong className="font-semibold text-chalet-dark">Room Service</strong> (enter your booking reference).
          </p>
        </div>

        {error && (
          <div className="text-center py-24 bg-white p-12 max-w-lg mx-auto border border-black/5">
            <p className="text-xl font-serif text-chalet-dark mb-4">Failed to load menu</p>
            <p className="text-chalet-gray font-light text-sm">{error}</p>
          </div>
        )}

        {!error && loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonMenuItem key={i} />)}
          </div>
        )}

        {!error && !loading && menuItems.length === 0 && (
          <div className="text-center py-32 bg-white border border-black/5">
            <p className="text-2xl font-serif text-chalet-dark mb-4">Menu coming soon</p>
            <p className="text-chalet-gray font-light">Our chefs are preparing something special.</p>
          </div>
        )}

        {!error && !loading && menuItems.length > 0 && (
          Object.entries(displayItems).map(([cat, catItems]) => (
            <CategorySection
              key={cat}
              category={cat}
              items={catItems}
              onAdd={handleAdd}
              justAdded={justAdded}
            />
          ))
        )}
      </main>

      {/* Reservation CTA */}
      <div
        id="contact"
        className="py-32 text-center bg-chalet-bg border-t border-black/5"
      >
        <p className="text-[10px] font-sans font-semibold uppercase tracking-[0.3em] text-chalet-gold mb-6">Reservations</p>
        <h2 className="text-4xl md:text-5xl font-serif text-chalet-dark mb-8">Reserve Your Table</h2>
        <div className="w-16 h-px bg-chalet-gold mx-auto mb-8"></div>
        <p className="text-chalet-dark-light max-w-md mx-auto mb-12 text-sm font-light leading-relaxed">
          Experience an unforgettable dining experience. Call us or book directly via email.
        </p>
        <a
          href="tel:+1234567890"
          className="inline-block px-10 py-4 bg-transparent border border-chalet-dark text-chalet-dark font-sans text-xs font-semibold tracking-widest uppercase hover:bg-chalet-dark hover:text-white transition-all duration-500"
        >
          Call to Book
        </a>
      </div>

      {/* Footer */}
      <footer className="bg-chalet-dark text-center py-12">
        <p className="text-white/40 text-[10px] font-sans tracking-widest uppercase mb-4">Grand<span className="text-chalet-gold italic font-serif text-sm ml-1 capitalize">Hotel</span></p>
        <p className="text-white/40 text-[10px] font-sans tracking-widest uppercase">© {new Date().getFullYear()} All rights reserved.</p>
      </footer>

      {/* Floating Cart Button */}
      <FloatingCartButton count={count} total={total} onClick={() => setShowCart(true)} />

      {/* Cart Sidebar */}
      {showCart && (
        <CartSidebar
          items={items}
          total={total}
          onUpdateQty={updateQty}
          onRemove={removeItem}
          onUpdateNotes={updateNotes}
          onCheckout={() => { setShowCart(false); setShowCheckout(true); }}
          onClose={() => setShowCart(false)}
        />
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <OrderCheckout
          items={items}
          total={total}
          onClose={() => { setShowCheckout(false); setShowCart(true); }}
          onSuccess={handleOrderSuccess}
        />
      )}

      {/* Success Screen */}
      {showSuccess && (
        <OrderSuccess orderType={orderType} onClose={() => setShowSuccess(false)} />
      )}
    </div>
  );
}
