import { useState, useCallback } from 'react';

export function useCart() {
  const [items, setItems] = useState([]);

  const addItem = useCallback((menuItem) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === menuItem.id);
      if (exists) {
        return prev.map(i => i.id === menuItem.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...menuItem, qty: 1, notes: '' }];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.id !== id));
    } else {
      setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
    }
  }, []);

  const updateNotes = useCallback((id, notes) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, notes } : i));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const total = items.reduce((sum, i) => sum + parseFloat(i.price || 0) * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return { items, addItem, removeItem, updateQty, updateNotes, clearCart, total, count };
}
