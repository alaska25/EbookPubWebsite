import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order");
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl text-ivory">Thank you for your order</h1>
      <p className="mt-4 text-ivory/60">
        Your payment was successful. It may take a few seconds for your new books to
        appear in your library while Stripe confirms the payment.
      </p>
      {orderId && <p className="mt-2 text-sm text-ivory/40">Order reference: {orderId}</p>}
      <Link
        to="/library"
        className="mt-8 inline-block rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink hover:bg-gold-400"
      >
        Go to my library
      </Link>
    </div>
  );
}
