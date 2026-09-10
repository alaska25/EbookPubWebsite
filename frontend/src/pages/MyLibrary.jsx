import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

export default function MyLibrary() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/auth/library")
      .then(({ data }) => setBooks(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-3xl text-ivory">My library</h1>

      {loading ? (
        <p className="mt-8 text-ivory/50">Loading…</p>
      ) : books.length === 0 ? (
        <p className="mt-8 text-ivory/50">
          You haven't added any books yet.{" "}
          <Link to="/catalog" className="text-gold-400 hover:text-gold-300">
            Browse the catalog
          </Link>
          .
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
          {books.map((book) => (
            <Link key={book._id} to={`/read/${book._id}`} className="group block">
              <div className="aspect-[2/3] overflow-hidden rounded-md bg-navy-800">
                <img
                  src={book.coverUrl}
                  alt={`Cover of ${book.title}`}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <h3 className="mt-3 font-display text-base leading-snug text-ivory group-hover:text-gold-400">
                {book.title}
              </h3>
              <p className="text-sm text-ivory/50">{book.author}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
