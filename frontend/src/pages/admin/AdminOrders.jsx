import { useEffect, useState } from "react";
import api from "../../api/axios.js";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders")
      .then(({ data }) => setOrders(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-ivory/50">Loading…</p>;
  if (orders.length === 0) return <p className="text-ivory/50">No orders yet.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-navy-700/60 text-ivory/50">
            <th className="py-2 pr-4">Customer</th>
            <th className="py-2 pr-4">Books</th>
            <th className="py-2 pr-4">Total</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id} className="border-b border-navy-700/40 text-ivory/80 align-top">
              <td className="py-3 pr-4">
                {o.user?.name}
                <br />
                <span className="text-ivory/40">{o.user?.email}</span>
              </td>
              <td className="py-3 pr-4">{o.books.map((b) => b.book?.title).join(", ")}</td>
              <td className="py-3 pr-4">${o.totalAmount.toFixed(2)}</td>
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
  );
}
