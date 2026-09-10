import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem("adyoolau_cart");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("adyoolau_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (book) => {
    setItems((prev) => (prev.some((b) => b._id === book._id) ? prev : [...prev, book]));
  };

  const removeItem = (bookId) => {
    setItems((prev) => prev.filter((b) => b._id !== bookId));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, b) => sum + b.price, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
