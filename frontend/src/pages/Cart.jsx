import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import { useEffect, useRef, useState } from "react";
import BackButton from "../components/BackButton.jsx";

// PayPal's JS SDK is loaded once and reused; this guards against loading
// it twice if the Cart page mounts more than once in a session.
let paypalScriptPromise = null;
const loadPaypalScript = (clientId) => {
  if (window.paypal) return Promise.resolve(window.paypal);
  if (paypalScriptPromise) return paypalScriptPromise;

  paypalScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`;
    script.onload = () => resolve(window.paypal);
    script.onerror = () => reject(new Error("Failed to load PayPal SDK"));
    document.body.appendChild(script);
  });

  return paypalScriptPromise;
};

// Cart items can be books or templates. Older cart entries saved before
// templates existed won't have `itemType` set, so we also fall back to
// checking `fileType === "zip"`, which only templates have.
const isTemplateItem = (item) => item.itemType === "template" || item.fileType === "zip";

export default function Cart() {
  const {
    items,
    removeItem,
    removeItems,
    isSelected,
    toggleSelected,
    selectAll,
    deselectAll,
    selectedItems,
    allSelected,
    total,
  } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [paypalReady, setPaypalReady] = useState(false);
  const buttonsContainerRef = useRef(null);

  const hasSelection = selectedItems.length > 0;

  // PayPal's callbacks are created once, so they'd see stale data if they read
  // `selectedItems` directly. This ref always holds the latest ticked items...
  const selectedItemsRef = useRef([]);
  selectedItemsRef.current = selectedItems;

  // ...and this one remembers exactly which ids were sent to PayPal, so only
  // those are removed after payment even if the ticks change mid-checkout.
  const purchasingIdsRef = useRef([]);

  useEffect(() => {
    if (!user || !hasSelection) return;

    let cancelled = false;

    loadPaypalScript(import.meta.env.VITE_PAYPAL_CLIENT_ID)
      .then((paypal) => {
        if (cancelled || !buttonsContainerRef.current) return;

        buttonsContainerRef.current.innerHTML = "";

        paypal
          .Buttons({
            style: { layout: "vertical", color: "gold", shape: "pill", label: "pay" },

            createOrder: async () => {
              setError("");
              const currentItems = selectedItemsRef.current;
              const bookIds = currentItems.filter((i) => !isTemplateItem(i)).map((i) => i._id);
              const templateIds = currentItems.filter(isTemplateItem).map((i) => i._id);
              purchasingIdsRef.current = currentItems.map((i) => i._id);

              try {
                const { data } = await api.post("/orders/paypal/create-order", {
                  bookIds,
                  templateIds,
                });
                return data.paypalOrderId;
              } catch (err) {
                setError(err.response?.data?.message || "Could not start checkout.");
                throw err;
              }
            },

            onApprove: async (data) => {
              try {
                const { data: result } = await api.post("/orders/paypal/capture-order", {
                  paypalOrderId: data.orderID,
                });
                // Remove only what was bought; items saved for later stay in the cart.
                removeItems(purchasingIdsRef.current);
                navigate(`/checkout/success?order=${result.orderId}`);
              } catch (err) {
                setError(err.response?.data?.message || "Payment could not be completed.");
              }
            },

            onError: () => {
              setError("Something went wrong with PayPal. Please try again.");
            },
          })
          .render(buttonsContainerRef.current);

        setPaypalReady(true);
      })
      .catch(() => setError("Could not load PayPal. Please refresh and try again."));

    return () => {
      cancelled = true;
    };
    // Buttons only need re-rendering when the login state changes or the
    // container appears/disappears; tick changes are handled by the refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, hasSelection]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <BackButton fallback="/catalog" className="mb-6" />

      <h1 className="font-display text-3xl text-ivory">Your cart</h1>

      {items.length === 0 ? (
        <p className="mt-8 text-ivory/50">Your cart is empty.</p>
      ) : (
        <div className="mt-8">
          <div className="flex items-center justify-between border-b border-navy-700/60 pb-3 text-sm">
            <label className="flex cursor-pointer items-center gap-3 text-ivory/70">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => (allSelected ? deselectAll() : selectAll())}
                className="h-5 w-5 cursor-pointer accent-gold-500"
              />
              Select all
            </label>
            <span className="text-ivory/50">
              {selectedItems.length} of {items.length} selected
            </span>
          </div>

          <div className="divide-y divide-navy-700/60">
            {items.map((item) => {
              const selected = isSelected(item._id);
              const template = isTemplateItem(item);
              const subtitle = template ? item.tagline || item.category : item.author;

              return (
                <div key={item._id} className="flex items-center gap-3 py-4 sm:gap-4">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleSelected(item._id)}
                    aria-label={`Include ${item.title} in checkout`}
                    className="h-5 w-5 shrink-0 cursor-pointer accent-gold-500"
                  />
                  <img
                    src={item.coverUrl}
                    alt=""
                    className={`h-20 w-14 shrink-0 rounded object-cover transition-opacity ${
                      selected ? "" : "opacity-50"
                    }`}
                  />
                  <div className={`min-w-0 flex-1 transition-opacity ${selected ? "" : "opacity-50"}`}>
                    <div className="flex items-center gap-2">
                      <p className="truncate font-display text-lg text-ivory">{item.title}</p>
                      {template && (
                        <span className="shrink-0 rounded-full border border-gold-500/30 bg-gold-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gold-400">
                          Template
                        </span>
                      )}
                    </div>
                    {subtitle && <p className="truncate text-sm text-ivory/50">{subtitle}</p>}
                    {!selected && <p className="mt-0.5 text-xs text-gold-400">Saved for later</p>}
                  </div>
                  <span className={`text-gold-400 ${selected ? "" : "opacity-50"}`}>
                    {item.isFree ? "Free" : `$${item.price.toFixed(2)}`}
                  </span>
                  <button
                    onClick={() => removeItem(item._id)}
                    className="text-sm text-ivory/40 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-8 border-t border-navy-700/60 pt-6">
          <div className="mb-6 flex items-center justify-between">
            <span className="font-display text-xl text-ivory">Total: ${total.toFixed(2)}</span>
            {hasSelection && (
              <span className="text-sm text-ivory/50">
                {selectedItems.length} {selectedItems.length === 1 ? "item" : "items"}
              </span>
            )}
          </div>

          {!hasSelection ? (
            <p className="text-sm text-ivory/50">Tick at least one item to check out.</p>
          ) : !user ? (
            <button
              onClick={() => navigate("/login")}
              className="rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink hover:bg-gold-400"
            >
              Sign in to check out
            </button>
          ) : (
            <div className="max-w-xs">
              <div ref={buttonsContainerRef} />
              {!paypalReady && <p className="text-sm text-ivory/40">Loading PayPal…</p>}
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </div>
  );
}