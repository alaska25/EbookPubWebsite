import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import BookCard from "../components/BookCard.jsx";

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const page = Number(searchParams.get("page") || 1);

  useEffect(() => {
    api.get("/books/categories").then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get("/books", { params: { search, category, page, limit: 12 } })
      .then(({ data }) => {
        setBooks(data.books);
        setPages(data.pages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, category, page]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="font-display text-3xl text-ivory">Catalog</h1>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          defaultValue={search}
          onKeyDown={(e) => e.key === "Enter" && updateParam("search", e.target.value)}
          placeholder="Search titles or authors…"
          className="rounded-full border border-navy-700 bg-navy-900 px-4 py-2 text-sm text-ivory placeholder:text-ivory/40 focus:border-gold-500"
        />
        <select
          value={category}
          onChange={(e) => updateParam("category", e.target.value)}
          className="rounded-full border border-navy-700 bg-navy-900 px-4 py-2 text-sm text-ivory focus:border-gold-500"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="mt-12 text-ivory/50">Loading books…</p>
      ) : books.length === 0 ? (
        <p className="mt-12 text-ivory/50">No books match your search.</p>
      ) : (
        <>
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
            {books.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>

          {pages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              {[...Array(pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => updateParam("page", i + 1)}
                  className={`h-9 w-9 rounded-full text-sm ${
                    page === i + 1
                      ? "bg-gold-500 text-ink"
                      : "border border-navy-700 text-ivory/70 hover:border-gold-500"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
