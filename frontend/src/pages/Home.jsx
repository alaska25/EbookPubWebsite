import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import BookCard from "../components/BookCard.jsx";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/books", { params: { limit: 8 } })
      .then(({ data }) => setFeatured(data.books))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="border-b border-navy-700/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[1.2fr,1fr] md:py-28">
          <div>
            <h1 className="font-display text-5xl leading-[1.1] text-ivory md:text-6xl">
              A library that fits in your pocket.
            </h1>
            <p className="mt-6 max-w-md text-lg text-ivory/60">
              Adyoolau brings together fiction, nonfiction, and reference titles
              you can buy once and read anywhere — in the browser or downloaded
              for offline reading.
            </p>
            <div className="mt-8 flex gap-4">
              <Link
                to="/catalog"
                className="rounded-full bg-gold-500 px-6 py-3 text-sm font-medium text-ink hover:bg-gold-400"
              >
                Browse the catalog
              </Link>
              <Link
                to="/catalog?search=free"
                className="rounded-full border border-navy-700 px-6 py-3 text-sm font-medium text-ivory/80 hover:border-gold-500 hover:text-gold-400"
              >
                Start with a free title
              </Link>
            </div>
          </div>
          <div className="hidden items-center justify-center md:flex">
            <div className="grid grid-cols-3 gap-3 opacity-90">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] w-20 rounded bg-gradient-to-b from-navy-700 to-navy-900"
                  style={{ transform: `translateY(${i % 2 === 0 ? "0" : "16px"})` }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-2xl text-ivory">Recently added</h2>
          <Link to="/catalog" className="text-sm text-gold-400 hover:text-gold-300">
            View all
          </Link>
        </div>

        {loading ? (
          <p className="text-ivory/50">Loading books…</p>
        ) : featured.length === 0 ? (
          <p className="text-ivory/50">No books yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
            {featured.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
