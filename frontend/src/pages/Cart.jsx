import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import { useState } from "react";

export default function Cart() {
  const { items, removeItem, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    if (!user) return navigate("/login");
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/orders/checkout", {
        bookIds: items.map((b) => b._id),
      });
      window.location.href = data.url; // redirect to Stripe Checkout
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong starting checkout.");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl text-ivory">Your cart</h1>

      {items.length === 0 ? (
        <p className="mt-8 text-ivory/50">Your cart is empty.</p>
      ) : (
        <div className="mt-8 divide-y divide-navy-700/60">
          {items.map((book) => (
            <div key={book._id} className="flex items-center gap-4 py-4">
              <img src={book.coverUrl} alt="" className="h-20 w-14 rounded object-cover" />
              <div className="flex-1">
                <p className="font-display text-lg text-ivory">{book.title}</p>
                <p className="text-sm text-ivory/50">{book.author}</p>
              </div>
              <span className="text-gold-400">${book.price.toFixed(2)}</span>
              <button
                onClick={() => removeItem(book._id)}
                className="text-sm text-ivory/40 hover:text-red-400"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-8 flex items-center justify-between border-t border-navy-700/60 pt-6">
          <span className="font-display text-xl text-ivory">Total: ${total.toFixed(2)}</span>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink hover:bg-gold-400 disabled:opacity-50"
          >
            {loading ? "Redirecting…" : "Checkout with Stripe"}
          </button>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </div>
  );
}
