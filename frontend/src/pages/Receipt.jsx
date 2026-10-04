import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios.js";

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

export default function Receipt() {
  const { id } = useParams();
  const [r, setR] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/account/orders/${id}/receipt`, { silent: true })
      .then(({ data }) => setR(data))
      .catch((err) => setError(err.response?.data?.message || "Could not load this receipt."));
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-ivory/70">{error}</p>
        <Link to="/account?tab=orders" className="mt-4 inline-block text-gold-400 hover:text-gold-300">
          Back to orders
        </Link>
      </div>
    );
  }
  if (!r) return <p className="px-6 py-24 text-center text-ivory/50">Loading…</p>;

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      {/* Hides the site header/footer and buttons when printing or saving as PDF. */}
      <style>{`@media print { header, footer, .no-print { display: none !important; } body, .bg-ink { background: #fff !important; } }`}</style>

      <div className="no-print mb-6 flex items-center justify-between">
        <Link to="/account?tab=orders" className="text-sm text-ivory/60 hover:text-ivory">← Back to orders</Link>
        <button
          onClick={() => window.print()}
          className="rounded-full bg-gold-500 px-5 py-2.5 text-sm font-medium text-ink hover:bg-gold-400"
        >
          Print or save as PDF
        </button>
      </div>

      <article className="rounded-2xl border border-navy-700/60 p-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl text-ivory">Receipt</h1>
            <p className="mt-1 text-sm text-ivory/60">Adyoolau</p>
          </div>
          <div className="text-right text-sm text-ivory/70">
            <p>Receipt #{r.receiptNo}</p>
            <p>{new Date(r.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
        </header>

        <div className="mt-6 text-sm">
          <p className="text-ivory/50">Billed to</p>
          <p className="text-ivory">{r.billedTo.name}</p>
          <p className="text-ivory/70">{r.billedTo.email}</p>
        </div>

        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b border-navy-700/60 text-left text-ivory/50">
              <th className="pb-2 font-normal">Item</th>
              <th className="pb-2 text-right font-normal">Price</th>
            </tr>
          </thead>
          <tbody>
            {r.items.map((it, i) => (
              <tr key={i} className="border-b border-navy-700/40">
                <td className="py-3 text-ivory">
                  {it.title} <span className="text-ivory/40">({it.kind})</span>
                </td>
                <td className="py-3 text-right text-ivory">{money(it.price)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="pt-4 font-display text-lg text-ivory">Total ({r.currency})</td>
              <td className="pt-4 text-right font-display text-lg text-ivory">{money(r.totalAmount)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-8 text-xs text-ivory/50">
          <p>Paid with {r.paymentMethod}</p>
          {r.transactionId && <p>Transaction ID: {r.transactionId}</p>}
        </div>
      </article>
    </div>
  );
}