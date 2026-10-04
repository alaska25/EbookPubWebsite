import { useEffect, useState } from "react";
import api from "../../api/axios.js";

const TABS = [
  { key: "all", label: "All" },
  { key: "books", label: "Books" },
  { key: "templates", label: "Templates" },
];

// Missing or null arrays (older orders) are treated as empty.
const list = (v) => (Array.isArray(v) ? v : []);

const hasBooks = (o) => list(o.books).length > 0;
const hasTemplates = (o) => list(o.templates).length > 0;

const formatMoney = (n) => `$${Number(n || 0).toFixed(2)}`;

// Shows the title when populated. A missing title means either the item was
// deleted (populate returns null) or the API didn't populate it (plain id).
const titleOf = (entry, key) => {
  const item = entry?.[key];
  if (item && typeof item === "object" && item.title) return item.title;
  if (entry?.title) return entry.title;
  return item ? "Untitled" : "Deleted item";
};

const titles = (items, key) =>
  list(items)
    .map((entry) => titleOf(entry, key))
    .join(", ") || "—";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all");

  useEffect(() => {
    api
      .get("/orders")
      .then(({ data }) => setOrders(list(data)))
      .catch((err) => setError(err.response?.data?.message || "Couldn't load orders."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-ivory/50">Loading…</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  const counts = {
    all: orders.length,
    books: orders.filter(hasBooks).length,
    templates: orders.filter(hasTemplates).length,
  };

  const visible =
    tab === "books"
      ? orders.filter(hasBooks)
      : tab === "templates"
      ? orders.filter(hasTemplates)
      : orders;

  const showBooks = tab !== "templates";
  const showTemplates = tab !== "books";

  return (
    <div>
      <div className="mb-5 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              tab === t.key
                ? "border-gold-500 bg-gold-500/10 text-gold-400"
                : "border-navy-700 text-ivory/60 hover:border-gold-500/50"
            }`}
          >
            {t.label}
            <span className="ml-2 text-xs opacity-60">{counts[t.key]}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="text-ivory/50">
          {tab === "all" ? "No orders yet." : `No ${tab} orders yet.`}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-navy-700/60 text-ivory/50">
                <th className="py-2 pr-4">Customer</th>
                {showBooks && <th className="py-2 pr-4">Books</th>}
                {showTemplates && <th className="py-2 pr-4">Templates</th>}
                <th className="py-2 pr-4">Total</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((o) => (
                <tr key={o._id} className="border-b border-navy-700/40 align-top text-ivory/80">
                  <td className="py-3 pr-4">
                    {o.user?.name}
                    <br />
                    <span className="text-ivory/40">{o.user?.email}</span>
                  </td>
                  {showBooks && <td className="py-3 pr-4">{titles(o.books, "book")}</td>}
                  {showTemplates && (
                    <td className="py-3 pr-4">{titles(o.templates, "template")}</td>
                  )}
                  <td className="py-3 pr-4">{formatMoney(o.totalAmount)}</td>
                  <td className="py-3 pr-4 capitalize">
                    <span
                      className={
                        o.status === "paid"
                          ? "text-green-400"
                          : o.status === "failed"
                          ? "text-red-400"
                          : "text-ivory/50"
                      }
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}