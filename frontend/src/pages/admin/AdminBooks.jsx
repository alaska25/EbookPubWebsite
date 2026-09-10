import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/books", { params: { limit: 100 } })
      .then(({ data }) => setBooks(data.books))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this book permanently? This also removes its files from storage.")) return;
    await api.delete(`/books/${id}`);
    load();
  };

  if (loading) return <p className="text-ivory/50">Loading…</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-navy-700/60 text-ivory/50">
            <th className="py-2 pr-4">Title</th>
            <th className="py-2 pr-4">Author</th>
            <th className="py-2 pr-4">Category</th>
            <th className="py-2 pr-4">Price</th>
            <th className="py-2 pr-4"></th>
          </tr>
        </thead>
        <tbody>
          {books.map((b) => (
            <tr key={b._id} className="border-b border-navy-700/40 text-ivory/80">
              <td className="py-3 pr-4">{b.title}</td>
              <td className="py-3 pr-4">{b.author}</td>
              <td className="py-3 pr-4">{b.category}</td>
              <td className="py-3 pr-4">{b.isFree ? "Free" : `$${b.price.toFixed(2)}`}</td>
              <td className="py-3 pr-4 text-right">
                <Link to={`/admin/books/${b._id}/edit`} className="mr-4 text-gold-400 hover:text-gold-300">
                  Edit
                </Link>
                <button onClick={() => handleDelete(b._id)} className="text-red-400 hover:text-red-300">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {books.length === 0 && <p className="mt-6 text-ivory/50">No books yet.</p>}
    </div>
  );
}
