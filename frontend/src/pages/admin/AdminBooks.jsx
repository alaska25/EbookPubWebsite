import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  // Tracks which row's toggle request is in flight, so we can disable just
  // that button and avoid double-clicks without blocking the whole table.
  const [togglingId, setTogglingId] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get("/books/admin", { params: { limit: 100 } })
      .then(({ data }) => setBooks(data.books))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this book permanently? This also removes its files from storage.")) return;
    await api.delete(`/books/${id}`);
    load();
  };

  const handleTogglePublish = async (book) => {
    const nextPublished = !book.published;
    setTogglingId(book._id);
    try {
      await api.put(`/books/${book._id}`, { published: nextPublished });
      // Update local state directly instead of a full reload, so the row
      // updates instantly and the rest of the table doesn't flicker.
      setBooks((prev) =>
        prev.map((b) => (b._id === book._id ? { ...b, published: nextPublished } : b))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Couldn't update publish status. Please try again.");
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) return <p className="text-ivory/50">Loading…</p>;

  const publishedCount = books.filter((b) => b.published !== false).length;
  const unpublishedCount = books.length - publishedCount;
  const catalogValue = books.reduce((sum, b) => sum + (b.isFree ? 0 : b.price || 0), 0);

  const stats = [
    { label: "Titles in catalog", value: books.length },
    { label: "Published", value: publishedCount },
    { label: "Unpublished", value: unpublishedCount },
    { label: "Combined list price", value: `$${catalogValue.toFixed(2)}` },
  ];

  return (
    <div>
      {/* Catalog stats — the numbers themselves carry the emphasis (set in
          the display serif), not an icon or a bordered tile per stat. */}
      <dl className="grid grid-cols-2 gap-x-8 gap-y-6 border-b border-navy-700/60 pb-8 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label}>
            <dd className="font-display text-3xl text-ivory">{s.value}</dd>
            <dt className="mt-1 text-sm text-ivory/50">{s.label}</dt>
          </div>
        ))}
      </dl>

      <div className="mt-8 overflow-hidden rounded-2xl border border-navy-700/60">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-navy-700/60 bg-navy-900/60 text-ivory/50">
                <th className="py-3 pl-5 pr-4 font-medium">Title</th>
                <th className="py-3 pr-4 font-medium">Author</th>
                <th className="py-3 pr-4 font-medium">Category</th>
                <th className="py-3 pr-4 font-medium">Price</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700/40">
              {books.map((b) => {
                // Treat missing `published` (books created before this field
                // existed) as published, so nothing disappears from the site
                // the first time this ships.
                const isPublished = b.published !== false;
                const isToggling = togglingId === b._id;

                return (
                  <tr key={b._id} className="text-ivory/80 transition-colors hover:bg-navy-900/40">
                    <td className="py-3.5 pl-5 pr-4 font-medium text-ivory">{b.title}</td>
                    <td className="py-3.5 pr-4 text-ivory/70">{b.author}</td>
                    <td className="py-3.5 pr-4 text-ivory/70">{b.category}</td>
                    <td className="py-3.5 pr-4 text-ivory/70">
                      {b.isFree ? "Free" : `$${b.price.toFixed(2)}`}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                          isPublished
                            ? "bg-[#22c55e]/10 text-[#22c55e]"
                            : "bg-ivory/10 text-ivory/50"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`h-1.5 w-1.5 rounded-full ${
                            isPublished ? "bg-[#22c55e]" : "bg-ivory/40"
                          }`}
                        />
                        {isPublished ? "Published" : "Unpublished"}
                      </span>
                    </td>
                    <td className="py-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1 text-xs font-medium">
                        <button
                          onClick={() => handleTogglePublish(b)}
                          disabled={isToggling}
                          className="rounded-full px-3 py-1.5 text-gold-400 transition-colors hover:bg-gold-500/10 hover:text-gold-300 disabled:opacity-50"
                        >
                          {isToggling ? "…" : isPublished ? "Unpublish" : "Publish"}
                        </button>
                        <Link
                          to={`/admin/books/${b._id}/edit`}
                          className="rounded-full px-3 py-1.5 text-gold-400 transition-colors hover:bg-gold-500/10 hover:text-gold-300"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(b._id)}
                          className="rounded-full px-3 py-1.5 text-red-400 transition-colors hover:bg-red-400/10 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {books.length === 0 && (
        <p className="mt-8 text-center text-ivory/50">
          No books yet — head to Add book to publish your first title.
        </p>
      )}
    </div>
  );
}