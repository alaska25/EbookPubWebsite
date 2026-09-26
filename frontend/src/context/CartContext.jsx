import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

const readStored = (key, fallback) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => readStored("adyoolau_cart", []));

  // Ids of books the shopper un-ticked ("buy later"). Storing the exceptions,
  // not the ticked ones, means every newly added book is ticked by default.
  const [buyLaterIds, setBuyLaterIds] = useState(() => readStored("adyoolau_cart_later", []));

  useEffect(() => {
    localStorage.setItem("adyoolau_cart", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("adyoolau_cart_later", JSON.stringify(buyLaterIds));
  }, [buyLaterIds]);

  const addItem = (book) => {
    setItems((prev) => (prev.some((b) => b._id === book._id) ? prev : [...prev, book]));
  };

  const removeItem = (bookId) => {
    setItems((prev) => prev.filter((b) => b._id !== bookId));
    setBuyLaterIds((prev) => prev.filter((id) => id !== bookId));
  };

  // Remove several books at once, e.g. only the ones that were just purchased.
  const removeItems = (bookIds) => {
    const ids = new Set(bookIds);
    setItems((prev) => prev.filter((b) => !ids.has(b._id)));
    setBuyLaterIds((prev) => prev.filter((id) => !ids.has(id)));
  };

  const clearCart = () => {
    setItems([]);
    setBuyLaterIds([]);
  };

  // --- Selection: which books are ticked for purchase right now ---
  const isSelected = (bookId) => !buyLaterIds.includes(bookId);

  const toggleSelected = (bookId) => {
    setBuyLaterIds((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  };

  const selectAll = () => setBuyLaterIds([]);
  const deselectAll = () => setBuyLaterIds(items.map((b) => b._id));

  const selectedItems = items.filter((b) => isSelected(b._id));
  const allSelected = items.length > 0 && selectedItems.length === items.length;

  // `total` is what the shopper is about to pay: ticked books only.
  const total = selectedItems.reduce((sum, b) => sum + b.price, 0);
  // Value of everything in the cart, ticked or not.
  const cartTotal = items.reduce((sum, b) => sum + b.price, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        removeItems,
        clearCart,
        isSelected,
        toggleSelected,
        selectAll,
        deselectAll,
        selectedItems,
        allSelected,
        total,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);