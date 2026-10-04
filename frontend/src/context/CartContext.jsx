import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

// Each shopper gets their own storage keys, so a cart never leaks from one
// account to the next on a shared device. Signed-out visitors use "guest".
const GUEST = "guest";
const cartKey = (owner) => `adyoolau_cart:${owner}`;
const laterKey = (owner) => `adyoolau_cart_later:${owner}`;

const readStored = (key, fallback) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

// Carts saved before templates were tagged with `itemType` would be sent to
// checkout as books. Templates are the only items with a zip file, so tag
// those on load. Entries that already have an itemType are left alone.
const tagLegacyItems = (items) =>
  items.map((item) =>
    item.itemType || item.fileType !== "zip" ? item : { ...item, itemType: "template" }
  );

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  // Change `_id` to `id` here if your user object uses that field name.
  const owner = user?._id || user?.id || GUEST;

  const [items, setItems] = useState([]);

  // Ids of items the shopper un-ticked ("buy later"). Storing the exceptions,
  // not the ticked ones, means every newly added item is ticked by default.
  const [buyLaterIds, setBuyLaterIds] = useState([]);

  // Set right after loading a new owner's cart, so the save effect below
  // skips one run and never writes the previous owner's items to the new key.
  const skipSave = useRef(true);

  // One-time cleanup: the old shared keys are what leaked carts between users.
  useEffect(() => {
    localStorage.removeItem("adyoolau_cart");
    localStorage.removeItem("adyoolau_cart_later");
  }, []);

  // Load the cart whenever the signed-in user changes (login, logout, switch).
  useEffect(() => {
    let nextItems = tagLegacyItems(readStored(cartKey(owner), []));
    let nextLater = readStored(laterKey(owner), []);

    // Items added while signed out move into the account's cart on login.
    if (owner !== GUEST) {
      const guestItems = tagLegacyItems(readStored(cartKey(GUEST), []));
      if (guestItems.length > 0) {
        const have = new Set(nextItems.map((i) => i._id));
        nextItems = [...nextItems, ...guestItems.filter((i) => !have.has(i._id))];
      }
      localStorage.removeItem(cartKey(GUEST));
      localStorage.removeItem(laterKey(GUEST));
    }

    skipSave.current = true;
    setItems(nextItems);
    setBuyLaterIds(nextLater);
  }, [owner]);

  // Save the current owner's cart.
  useEffect(() => {
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    try {
      localStorage.setItem(cartKey(owner), JSON.stringify(items));
      localStorage.setItem(laterKey(owner), JSON.stringify(buyLaterIds));
    } catch {
      /* storage full or blocked: the cart still works for this session */
    }
  }, [items, buyLaterIds, owner]);

  const addItem = (item) => {
    setItems((prev) => (prev.some((i) => i._id === item._id) ? prev : [...prev, item]));
  };

  const removeItem = (itemId) => {
    setItems((prev) => prev.filter((i) => i._id !== itemId));
    setBuyLaterIds((prev) => prev.filter((id) => id !== itemId));
  };

  // Remove several items at once, e.g. only the ones that were just purchased.
  const removeItems = (itemIds) => {
    const ids = new Set(itemIds);
    setItems((prev) => prev.filter((i) => !ids.has(i._id)));
    setBuyLaterIds((prev) => prev.filter((id) => !ids.has(id)));
  };

  const clearCart = () => {
    setItems([]);
    setBuyLaterIds([]);
  };

  // --- Selection: which items are ticked for purchase right now ---
  const isSelected = (itemId) => !buyLaterIds.includes(itemId);

  const toggleSelected = (itemId) => {
    setBuyLaterIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const selectAll = () => setBuyLaterIds([]);
  const deselectAll = () => setBuyLaterIds(items.map((i) => i._id));

  const selectedItems = items.filter((i) => isSelected(i._id));
  const allSelected = items.length > 0 && selectedItems.length === items.length;

  // `total` is what the shopper is about to pay: ticked items only.
  const total = selectedItems.reduce((sum, i) => sum + i.price, 0);
  // Value of everything in the cart, ticked or not.
  const cartTotal = items.reduce((sum, i) => sum + i.price, 0);

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